let map;
let gridLayer;

const MapModule = {
  init(containerId) {
    map = L.map(containerId, {
      center: [48.5, 31.0],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
      minZoom: 4,
      maxZoom: 11,
      preferCanvas: true,
      worldCopyJump: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 12, minZoom: 4,
    }).addTo(map);

    // Контур Украины
    L.polygon(UKRAINE_POLY.map(p => [p[1], p[0]]), {
      color: '#44506a', weight: 1.4, opacity: 0.7,
      fill: true, fillColor: '#f2f5f9', fillOpacity: 0.75,
      interactive: false,
    }).addTo(map);

    // Кастомный GridLayer с ячейками контроля
    gridLayer = new L.GridLayer({ opacity: 0.9 });
    gridLayer.createTile = function (coords) {
      const tile = L.DomUtil.create('canvas', 'leaflet-tile');
      const size = this.getTileSize();
      tile.width = size.x;
      tile.height = size.y;
      const ctx = tile.getContext('2d');

      const nwPoint = coords.scaleBy(size);
      const sePoint = nwPoint.add(size);
      const nw = map.unproject(nwPoint, coords.z);
      const se = map.unproject(sePoint, coords.z);

      const i0 = Math.max(0, Math.floor((nw.lng - GRID_LON0) / CELL_W));
      const i1 = Math.min(COLS - 1, Math.ceil((se.lng - GRID_LON0) / CELL_W));
      const j0 = Math.max(0, Math.floor((se.lat - GRID_LAT0) / CELL_H));
      const j1 = Math.min(ROWS - 1, Math.ceil((nw.lat - GRID_LAT0) / CELL_H));

      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          if (!GameState.state.inside[j][i]) continue;
          const owner = GameState.state.owner[j][i];
          if (!owner) continue;

          let color;
          if (GrayZone.isCellGray(i, j)) {
            color = 'rgba(136,146,160,0.62)';
          } else if (owner === 'UA') {
            color = 'rgba(31,111,235,0.55)';
          } else if (owner === 'RU') {
            color = 'rgba(195,42,48,0.55)';
          } else {
            color = 'rgba(180,190,200,0.35)';
          }
          ctx.fillStyle = color;

          const lon0 = GRID_LON0 + i * CELL_W;
          const lon1 = lon0 + CELL_W;
          const lat0 = GRID_LAT0 + j * CELL_H;
          const lat1 = lat0 + CELL_H;

          const p1 = map.project([lat1, lon0], coords.z).subtract(nwPoint);
          const p2 = map.project([lat0, lon1], coords.z).subtract(nwPoint);

          ctx.fillRect(
            Math.round(p1.x), Math.round(p1.y),
            Math.round(p2.x - p1.x) + 1, Math.round(p2.y - p1.y) + 1
          );
        }
      }
      return tile;
    };
    gridLayer.addTo(map);

    // Обновление видимости городов при изменении зума
    map.on('zoomend', () => {
      Cities.updateVisibility(map.getZoom());
    });

    this.bindDrawing();
    return map;
  },

  bindDrawing() {
    const overlay = document.getElementById('draw-overlay');

    const eventToLatLng = (e) => {
      const t = (e.touches && e.touches[0]) ||
                (e.changedTouches && e.changedTouches[0]) || e;
      const rect = map.getContainer().getBoundingClientRect();
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;
      return map.containerPointToLatLng([x, y]);
    };

    // === Touch ===
    overlay.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) { Territory.cancelPath(); return; }
      e.preventDefault();
      Territory.startPath(eventToLatLng(e));
    }, { passive: false });

    overlay.addEventListener('touchmove', (e) => {
      if (!Territory.drawing) return;
      if (e.touches.length > 1) { Territory.cancelPath(); return; }
      e.preventDefault();
      Territory.addPoint(eventToLatLng(e));
    }, { passive: false });

    overlay.addEventListener('touchend', (e) => {
      if (!Territory.drawing) return;
      e.preventDefault();
      Territory.finishPath();
    }, { passive: false });

    // === Mouse (desktop) ===
    overlay.addEventListener('mousedown', (e) => {
      Territory.startPath(eventToLatLng(e));
    });
    window.addEventListener('mousemove', (e) => {
      if (!Territory.drawing) return;
      Territory.addPoint(eventToLatLng(e));
    });
    window.addEventListener('mouseup', (e) => {
      if (!Territory.drawing) return;
      Territory.finishPath();
    });
  },
};
