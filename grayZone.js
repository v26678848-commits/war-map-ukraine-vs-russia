const GrayZone = {
  grayCells: null,   // Map<"i,j", distance>

  compute() {
    const s = GameState.state;
    const width = s.grayWidth || 2;
    const dist = new Map();
    const queue = [];

    const isBorder = (i, j) => {
      const o = s.owner[j][i];
      if (!o) return false;
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          if (di === 0 && dj === 0) continue;
          const ni = i + di, nj = j + dj;
          if (ni < 0 || nj < 0 || ni >= COLS || nj >= ROWS) continue;
          if (!s.inside[nj][ni]) continue;
          const no = s.owner[nj][ni];
          if (no && no !== o) return true;
        }
      }
      return false;
    };

    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        if (!s.inside[j][i] || !s.owner[j][i]) continue;
        if (isBorder(i, j)) {
          const k = i + ',' + j;
          dist.set(k, 0);
          queue.push([i, j]);
        }
      }
    }

    // BFS-расширение буфера
    let head = 0;
    while (head < queue.length) {
      const [i, j] = queue[head++];
      const d = dist.get(i + ',' + j);
      if (d >= width) continue;
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          if (di === 0 && dj === 0) continue;
          const ni = i + di, nj = j + dj;
          if (ni < 0 || nj < 0 || ni >= COLS || nj >= ROWS) continue;
          if (!s.inside[nj][ni] || !s.owner[nj][ni]) continue;
          const k = ni + ',' + nj;
          if (!dist.has(k) || dist.get(k) > d + 1) {
            dist.set(k, d + 1);
            queue.push([ni, nj]);
          }
        }
      }
    }

    this.grayCells = dist;
  },

  isCellGray(i, j) {
    if (!this.grayCells) return false;
    return this.grayCells.has(i + ',' + j);
  }
};
