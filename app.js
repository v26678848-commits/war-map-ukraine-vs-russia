window.addEventListener('DOMContentLoaded', () => {
  // Кнопки главного меню
  document.querySelectorAll('#menu .side-btn').forEach(btn => {
    btn.onclick = () => startGame(btn.dataset.side, false);
  });

  document.getElementById('btn-load-menu').onclick = () => {
    if (GameState.load()) {
      startGame(GameState.state.playerSide, true);
    } else {
      alert('Збереження не знайдено');
    }
  };
});

function startGame(side, loaded) {
  if (!loaded) {
    GameState.init();
    GameState.state.playerSide = side;
  }

  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');

  // Инициализация карты
  MapModule.init('map');

  // Первый расчёт серой зоны
  GrayZone.compute();

  // Города
  Cities.addTo(map);

  // UI
  UI.init();
  UI.syncSideButtons();
  UI.updateStats();
  UI.updateHistory();

  // Форсируем пересчёт размеров после появления
  setTimeout(() => {
    map.invalidateSize();
    gridLayer.redraw();
    Cities.updateVisibility(map.getZoom());
    Cities.updateAll();
  }, 150);
}
