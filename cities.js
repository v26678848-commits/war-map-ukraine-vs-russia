const CITIES = [
  { name: 'Київ',            region: 'Київська',        lat: 50.45, lon: 30.52, pop: 2950000, major: true },
  { name: 'Харків',          region: 'Харківська',      lat: 49.99, lon: 36.23, pop: 1430000, major: true },
  { name: 'Одеса',           region: 'Одеська',         lat: 46.48, lon: 30.73, pop: 1010000, major: true },
  { name: 'Дніпро',          region: 'Дніпропетровська',lat: 48.46, lon: 35.05, pop: 980000,  major: true },
  { name: 'Донецьк',         region: 'Донецька',        lat: 48.00, lon: 37.80, pop: 900000,  major: true },
  { name: 'Запоріжжя',       region: 'Запорізька',      lat: 47.83, lon: 35.14, pop: 710000,  major: true },
  { name: 'Львів',           region: 'Львівська',       lat: 49.84, lon: 24.03, pop: 720000,  major: true },
  { name: 'Кривий Ріг',      region: 'Дніпропетровська',lat: 47.91, lon: 33.35, pop: 620000 },
  { name: 'Миколаїв',        region: 'Миколаївська',    lat: 46.97, lon: 31.99, pop: 470000 },
  { name: 'Маріуполь',       region: 'Донецька',        lat: 47.10, lon: 37.55, pop: 430000 },
  { name: 'Луганськ',        region: 'Луганська',       lat: 48.57, lon: 39.30, pop: 400000 },
  { name: 'Вінниця',         region: 'Вінницька',       lat: 49.23, lon: 28.48, pop: 370000 },
  { name: 'Херсон',          region: 'Херсонська',      lat: 46.63, lon: 32.62, pop: 280000 },
  { name: 'Полтава',         region: 'Полтавська',      lat: 49.59, lon: 34.55, pop: 280000 },
  { name: 'Чернігів',        region: 'Чернігівська',    lat: 51.50, lon: 31.28, pop: 280000 },
  { name: 'Черкаси',         region: 'Черкаська',       lat: 49.44, lon: 32.06, pop: 270000 },
  { name: 'Житомир',         region: 'Житомирська',     lat: 50.25, lon: 28.66, pop: 260000 },
  { name: 'Суми',            region: 'Сумська',         lat: 50.91, lon: 34.80, pop: 260000 },
  { name: 'Хмельницький',    region: 'Хмельницька',     lat: 49.42, lon: 26.98, pop: 270000 },
  { name: 'Рівне',           region: 'Рівненська',      lat: 50.62, lon: 26.25, pop: 240000 },
  { name: 'Кропивницький',   region: 'Кіровоградська',  lat: 48.51, lon: 32.26, pop: 230000 },
  { name: 'Івано-Франківськ',region: 'Івано-Франківська',lat:48.92, lon: 24.71, pop: 230000 },
  { name: 'Тернопіль',       region: 'Тернопільська',   lat: 49.55, lon: 25.60, pop: 220000 },
  { name: 'Луцьк',           region: 'Волинська',       lat: 50.75, lon: 25.34, pop: 215000 },
  { name: 'Чернівці',        region: 'Чернівецька',     lat: 48.29, lon: 25.94, pop: 265000 },
  { name: 'Ужгород',         region: 'Закарпатська',    lat: 48.62, lon: 22.29, pop: 115000 },
  { name: 'Краматорськ',     region: 'Донецька',        lat: 48.74, lon: 37.56, pop: 150000 },
  { name: 'Мелітополь',      region: 'Запорізька',      lat: 46.84, lon: 35.37, pop: 150000 },
  { name: 'Бердянськ',       region: 'Запорізька',      lat: 46.76, lon: 36.79, pop: 115000 },
  { name: 'Сімферополь',     region: 'Крим',            lat: 44.95, lon: 34.10, pop: 340000 },
  { name: 'Севастополь',     region: 'Крим',            lat: 44.62, lon: 33.53, pop: 450000 },
  { name: 'Керч',            region: 'Крим',            lat: 45.35, lon: 36.47, pop: 150000 },
  { name: 'Біла Церква',     region: 'Київська',        lat: 49.80, lon: 30.11, pop: 210000 },
  { name: 'Кременчук',       region: 'Полтавська',      lat: 49.07, lon: 33.42, pop: 220000 },
  { name: 'Кам\'янець-Подільський', region: 'Хмельницька', lat: 48.68, lon: 26.58, pop: 100000 },
  { name: 'Мукачево',        region: 'Закарпатська',    lat: 48.44, lon: 22.72, pop: 85000 },
  { name: 'Дрогобич',        region: 'Львівська',       lat: 49.35, lon: 23.50, pop: 95000 },
  { name: 'Умань',           region: 'Черкаська',       lat: 48.75, lon: 30.22, pop: 83000 },
  { name: 'Бровари',         region: 'Київська',        lat: 50.51, lon: 30.79, pop: 100000 },
];

const Cities = {
  markers: [],

  addTo(map) {
    CITIES.forEach(c => {
      const size = c.major ? 14 : 9;
      const icon = L.divIcon({
        className: 'city-marker',
        html: `<div class="city-dot" style="width:${size}px;height:${size}px;"></div>
               <div class="city-label">${c.name}</div>`,
        iconSize: [0, 0],
        iconAnchor: [size / 2, size / 2],
      });
      const m = L.marker([c.lat, c.lon], { icon, riseOnHover: true });
      m.cityData = c;
      m.on('click', () => UI.showCity(c, Cities.getControl(c)));
      m.addTo(map);
      this.markers.push(m);
      c._marker = m;
    });
  },

  getControl(c) {
    const i = Math.floor((c.lon - GRID_LON0) / CELL_W);
    const j = Math.floor((c.lat - GRID_LAT0) / CELL_H);
    const owner = GameState.getCell(i, j);
    if (!owner) return 'neutral';
    if (GrayZone.isCellGray(i, j)) return 'gray';
    return owner;
  },

  updateAll() {
    CITIES.forEach(c => {
      if (!c._marker) return;
      const ctrl = this.getControl(c);
      const el = c._marker.getElement();
      if (!el) return;
      const dot = el.querySelector('.city-dot');
      if (!dot) return;
      dot.style.background =
        ctrl === 'UA' ? '#1f6feb' :
        ctrl === 'RU' ? '#c32a30' :
        ctrl === 'gray' ? '#8892a0' : '#8899aa';
    });
  },

  updateVisibility(zoom) {
    CITIES.forEach(c => {
      if (!c._marker) return;
      const el = c._marker.getElement();
      if (!el) return;
      const showLabel = c.major || zoom >= 7;
      el.classList.toggle('no-label', !showLabel);
      el.style.display = (c.major || zoom >= 6) ? '' : 'none';
    });
  }
};
