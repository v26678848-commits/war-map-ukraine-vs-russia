const Territory = {
  pathPoints: [],
  drawing: false,
  mode: false,
  polyline: null,

  setMode(on) {
    this.mode = on;
    const overlay = document.getElementById('draw-overlay');
    if (on) {
      overlay.classList.remove('hidden');
      map.dragging.disable();
      map.touchZoom.disable();
    } else {
      overlay.classList.add('hidden');
      map.dragging.enable();
      map.touchZoom.enable();
      this.cancelPath();
    }
  },

  startPath(latlng) {
    this.pathPoints = [latlng];
    this.drawing = true;
    if (this.polyline) map.removeLayer(this.polyline);
    this.polyline = L.polyline([latlng], {
      color: '#ffd84d', weight: 3, opacity: 0.95,
      lineJoin: 'round', lineCap: 'round'
    }).addTo(map);
  },

  addPoint(latlng) {
    if (!this.drawing) return;
    const last = this.pathPoints[this.pathPoints.length - 1];
    // Сглаживание — не добавляем слишком близкие точки
    const p1 = map.latLngToContainerPoint(last);
    const p2 = map.latLngToContainerPoint(latlng);
    const d = p1.distanceTo(p2);
    if (d < 6) return;
    this.pathPoints.push(latlng);
    this.polyline.setLatLngs(this.pathPoints);
  },

  finishPath() {
    if (!this.drawing) return;
    this.drawing = false;
    const pts = this.pathPoints.slice();
    this.cancelPath();
    if (pts.length < 4) return;
    this.tryCapture(pts);
  },

  cancelPath() {
    this.drawing = false;
    this.pathPoints = [];
    if (this.polyline) { map.removeLayer(this.polyline); this.polyline = null; }
  },

  polygonAreaKm2(poly) {
    if (poly.length < 3) return 0;
    const R = 6371;
    let area = 0;
    for (let i = 0; i < poly.length; i++) {
      const [lon1, lat1] = poly[i];
      const [lon2, lat2] = poly[(i + 1) % poly.length];
      const x1 = lon1 * Math.PI / 180 * R * Math.cos(lat1 * Math.PI / 180);
      const y1 = lat1 * Math.PI / 180 * R;
      const x2 = lon2 * Math.PI / 180 * R * Math.cos(lat2 * Math.PI / 180);
      const y2 = lat2 * Math.PI / 180 * R;
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area / 2);
  },

  tryCapture(latlngs) {
    const poly = latlngs.map(p => [p.lng, p.lat]);
    const areaKm2 = this.polygonAreaKm2(poly);

    if (areaKm2 > GameState.state.maxCaptureArea) {
      UI.toast('Неможливо захопити цю ділянку');
      return;
    }

    // Bbox для ускорения
    let minLon = 999, maxLon = -999, minLat = 999, maxLat = -999;
    for (const [lon, lat] of poly) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
    const i0 = Math.max(0, Math.floor((minLon - GRID_LON0) / CELL_W));
    const i1 = Math.min(COLS - 1, Math.ceil((maxLon - GRID_LON0) / CELL_W));
    const j0 = Math.max(0, Math.floor((minLat - GRID_LAT0) / CELL_H));
    const j1 = Math.min(ROWS - 1, Math.ceil((maxLat - GRID_LAT0) / CELL_H));

    const side = GameState.state.playerSide;
    const cells = [];
    let touchesOwn = false;

    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        if (!GameState.state.inside[j][i]) continue;
        const [lon, lat] = cellCenter(i, j);
        if (!pointInPoly(lon, lat, poly)) continue;
        cells.push([i, j]);
        // Проверяем соседей на принадлежность игроку
        for (let dj = -1; dj <= 1; dj++) {
          for (let di = -1; di <= 1; di++) {
            if (di === 0 && dj === 0) continue;
            if (GameState.getCell(i + di, j + dj) === side) touchesOwn = true;
          }
        }
      }
    }

    if (cells.length === 0) {
      UI.toast('Неможливо захопити цю ділянку');
      return;
    }

    if (!touchesOwn) {
      UI.toast('Ділянка не межує з вашою територією');
      return;
    }

    this.applyCapture(cells, side);
  },

  applyCapture(cells, side) {
    GameState.snapshot();
    const before = cells.map(([i, j]) => GameState.state.owner[j][i]);

    cells.forEach(([i, j]) => GameState.setCell(i, j, side));

    const km2 = cells.length * cellKm2();
    GameState.state.capturedKm2 += km2;

    const sideName = side === 'UA' ? 'Україна' : 'Росія';
    GameState.addHistory(`${sideName} захопила ділянку (~${km2.toFixed(0)} км²)`);

    GrayZone.compute();
    gridLayer.redraw();
    UI.updateStats();
    Cities.updateAll();
  }
};
