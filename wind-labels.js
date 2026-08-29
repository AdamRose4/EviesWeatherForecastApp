// Wind categories for hourly forecast tiles only.
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

  function updateHourlyWindLabels() {
    document.querySelectorAll('#hourlyForecast .hour-card .hour-extra, #tomorrowHourlyForecast .hour-card .hour-extra').forEach(line => {
      const text = line.textContent || '';
      if (!text.includes('💨')) return;

      const match = text.match(/(\d+)\s*km\/h/);
      if (!match) return;

      const speed = Number(match[1]);
      const wanted = `💨 ${speed} km/h ${windCategory(speed)}`;
      if (line.textContent !== wanted) line.textContent = wanted;
    });
  }

  // No MutationObserver here: it previously reacted to its own text updates and
  // could lock the page during initial rendering. A lightweight timer is safe,
  // idempotent and also picks up the app's 60-second weather refreshes.
  window.windCategory = windCategory;
  window.updateHourlyWindLabels = updateHourlyWindLabels;

  updateHourlyWindLabels();
  setInterval(updateHourlyWindLabels, 1000);
})();
