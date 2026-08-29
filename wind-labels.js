// Wind presentation for hourly forecast tiles only.
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

  function updateWindLabels() {
    // Only alter wind text inside the Next 24 Hours and Tomorrow hourly tiles.
    document.querySelectorAll('#hourlyForecast .hour-card .hour-extra, #tomorrowHourlyForecast .hour-card .hour-extra').forEach(line => {
      const text = line.textContent || '';
      if (!text.includes('💨')) return;
      const match = text.match(/(\d+)\s*km\/h/);
      if (!match) return;
      const speed = Number(match[1]);
      line.textContent = `💨 ${speed} km/h ${windCategory(speed)}`;
    });
  }

  const root = document.getElementById('weatherContent') || document.body;
  const observer = new MutationObserver(() => updateWindLabels());
  observer.observe(root, { childList: true, subtree: true, characterData: true });

  window.windCategory = windCategory;
  window.updateWindLabels = updateWindLabels;

  let tries = 0;
  const starter = setInterval(() => {
    tries += 1;
    updateWindLabels();
    if (document.querySelector('.hour-card') || tries >= 40) clearInterval(starter);
  }, 250);
})();
