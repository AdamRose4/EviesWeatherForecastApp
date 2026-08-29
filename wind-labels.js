// Wind presentation: show speed first, followed by a plain-English wind category.
(function () {
  function windCategory(speed) {
    const s = Math.round(Number(speed));
    if (!Number.isFinite(s)) return '—';
    if (s <= 3) return 'Calm';
    if (s <= 18) return 'Breeze';
    if (s <= 31) return 'Strong Breeze';
    if (s <= 45) return 'Gale';
    return 'Strong Gale';
  }

  function getAppState() {
    try {
      return typeof state !== 'undefined' ? state : null;
    } catch (_) {
      return null;
    }
  }

  function updateWindLabels() {
    const appState = getAppState();
    if (!appState?.data) return;

    // Main summary card: speed on the first line, category underneath.
    const windValue = document.getElementById('wind');
    const windStat = windValue?.closest('.stat');
    const windTitle = windStat?.querySelector('small');
    const currentSpeed = Number(appState.data.current?.wind_speed_10m);
    if (windValue && Number.isFinite(currentSpeed)) {
      const rounded = Math.round(currentSpeed);
      if (windTitle) windTitle.textContent = `${rounded} km/h`;
      windValue.textContent = windCategory(rounded);
    }

    // Hourly cards: append the same category after the speed.
    document.querySelectorAll('.hour-card .hour-extra').forEach(line => {
      const text = line.textContent || '';
      if (!text.includes('💨')) return;
      const match = text.match(/(\d+)\s*km\/h/);
      if (!match) return;
      const speed = Number(match[1]);
      line.textContent = `💨 ${speed} km/h ${windCategory(speed)}`;
    });
  }

  const observer = new MutationObserver(() => updateWindLabels());
  const root = document.getElementById('weatherContent') || document.body;
  observer.observe(root, { childList: true, subtree: true, characterData: true });

  window.windCategory = windCategory;
  window.updateWindLabels = updateWindLabels;

  let tries = 0;
  const starter = setInterval(() => {
    tries += 1;
    updateWindLabels();
    if (getAppState()?.data || tries >= 40) clearInterval(starter);
  }, 250);
})();
