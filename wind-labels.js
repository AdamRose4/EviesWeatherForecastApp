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
      const category = windCategory(speed);
      const wanted = `💨 ${speed} km/h\n${category}`;

      if (line.dataset.windFormatted !== wanted) {
        line.innerHTML = `<span class="wind-speed">💨 ${speed} km/h</span><span class="wind-category">${category}</span>`;
        line.dataset.windFormatted = wanted;
      }
    });
  }

  // No MutationObserver here: a lightweight timer safely picks up normal renders
  // and the app's 60-second weather refresh without creating a feedback loop.
  window.windCategory = windCategory;
  window.updateHourlyWindLabels = updateHourlyWindLabels;

  updateHourlyWindLabels();
  setInterval(updateHourlyWindLabels, 1000);
})();
