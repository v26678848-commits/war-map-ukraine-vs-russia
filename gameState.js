// ==== Геометрия сетки контроля ====
const GRID_LON0 = 22.0;
const GRID_LAT0 = 44.0;
const CELL_W = 0.3;   // ~ 22 км по долготе
const CELL_H = 0.25;  // ~ 28 км по широте
const COLS = Math.ceil((40.5 - GRID_LON0) / CELL_W);
const ROWS = Math.ceil((52.5 - GRID_LAT0) / CELL_H);

// Упрощённый контур Украины (визуально узнаваемый, для прототипа)
const UKRAINE_POLY = [
  [22.14,48.42],[22.62,49.08],[23.20,49.68],[23.66,49.94],
  [23.80,50.40],[24.05,50.72],[23.72,51.14],[23.63,51.51],
  [24.28,51.90],[25.30,51.96],[26.50,51.85],[27.75,51.60],
  [28.60,51.55],[29.90,51.42],[30.53,51.35],[31.10,51.55],
  [31.79,52.10],[32.80,52.30],[33.40,52.30],[34.40,51.85],
  [35.20,51.30],[35.80,51.10],[36.20,50.60],[36.90,50.30],
  [37.60,50.30],[38.30,50.10],[39.20,49.85],[39.90,49.85],
  [40.15,49.20],[39.80,48.60],[39.50,48.00],[38.60,47.60],
  [38.20,47.30],[37.60,47.10],[36.80,46.90],[35.90,46.60],
  [35.20,46.20],[34.60,46.00],[34.60,45.60],[35.40,45.30],
  [36.00,45.40],[36.60,45.40],[36.60,45.00],[36.20,44.60],
  [35.20,44.60],[34.60,44.80],[33.60,44.40],[33.20,45.20],
  [32.50,46.15],[31.50,46.55],[30.80,46.55],[30.20,46.20],
  [29.70,45.90],[29.20,45.40],[28.60,45.40],[28.20,45.90],
  [28.20,46.30],[27.50,46.50],[26.90,47.00],[26.60,47.90],
  [26.40,48.20],[25.80,48.30],[25.20,47.90],[24.70,47.75],
  [24.00,47.75],[23.30,48.00],[22.80,48.10],[22.60,48.10],
  [22.14,48.42]
];

function pointInPoly(lon, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
                      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function cellCenter(i, j) {
  return [GRID_LON0 + (i + 0.5) * CELL_W, GRID_LAT0 + (j + 0.5) * CELL_H];
}

function cellKm2() {
  const avgLat = 49;
  const degLonKm = 111.32 * Math.cos(avgLat * Math.PI / 180);
  const degLatKm = 110.57;
  return CELL_W * degLonKm * CELL_H * degLatKm;
}

// ==== Игровое состояние ====
const GameState = {
  state: null,
  SAVE_KEY: 'warMapSave_v1',

  init() {
    const owner = [];
    const inside = [];
    for (let j = 0; j < ROWS; j++) {
      owner.push(new Array(COLS).fill(null));
      inside.push(new Array(COLS).fill(false));
    }

    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        const [lon, lat] = cellCenter(i, j);
        if (!pointInPoly(lon, lat, UKRAINE_POLY)) continue;
        inside[j][i] = true;
        // Начальное распределение: восток и Крым — RU, остальное — UA
        let side = 'UA';
        if (lat < 46.3 && lon > 32.5) side = 'RU';       // Крым
        else if (lon > 33.5) side = 'RU';                // Восточная половина
        owner[j][i] = side;
      }
    }

    this.state = {
      owner, inside,
      playerSide: 'UA',
      history: [],
      capturedKm2: 0,
      grayWidth: 2,             // ширина серой зоны в клетках
      maxCaptureArea: 120000,   // макс. площадь одного захвата (км²)
      lastSnapshot: null,
      totalCells: 0,
    };
    this.recount();
  },

  recount() {
    let total = 0;
    for (let j = 0; j < ROWS; j++)
      for (let i = 0; i < COLS; i++)
        if (this.state.inside[j][i]) total++;
    this.state.totalCells = total;
  },

  getCell(i, j) {
    if (i < 0 || j < 0 || i >= COLS || j >= ROWS) return null;
    if (!this.state.inside[j][i]) return null;
    return this.state.owner[j][i];
  },

  setCell(i, j, owner) {
    if (i < 0 || j < 0 || i >= COLS || j >= ROWS) return;
    if (!this.state.inside[j][i]) return;
    this.state.owner[j][i] = owner;
  },

  snapshot() {
    this.state.lastSnapshot = {
      owner: this.state.owner.map(r => r.slice()),
      capturedKm2: this.state.capturedKm2,
    };
  },

  addHistory(text) {
    this.state.history.push({
      text,
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    });
    if (this.state.history.length > 60) this.state.history.shift();
  },

  save() {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify({
        owner: this.state.owner,
        inside: this.state.inside,
        playerSide: this.state.playerSide,
        history: this.state.history.slice(-30),
        capturedKm2: this.state.capturedKm2,
      }));
      return true;
    } catch (e) { return false; }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      this.init();
      this.state.owner = d.owner;
      this.state.inside = d.inside;
      this.state.playerSide = d.playerSide || 'UA';
      this.state.history = d.history || [];
      this.state.capturedKm2 = d.capturedKm2 || 0;
      this.recount();
      return true;
    } catch (e) { return false; }
  },

  reset() { this.init(); }
};
