// Wind categories for hourly forecast tiles only.
(function () {
  function windCategory(speed, lang='en') {
    const s = Math.round(Number(speed));
    if (!Number.isFinite(s)) return '—';
    const sk = lang === 'sk';
    if (s <= 3) return sk ? 'Bezvetrie' : 'Calm';
    if (s <= 18) return sk ? 'Vánok' : 'Breeze';
    if (s <= 31) return sk ? 'Silný vietor' : 'Strong Breeze';
    if (s <= 45) return sk ? 'Víchrica' : 'Gale';
    return sk ? 'Silná víchrica' : 'Strong Gale';
  }

  function updateHourlyWindLabels() {
    const lang = typeof window.getEviesLanguage === 'function' ? window.getEviesLanguage() : 'en';
    document.querySelectorAll('#hourlyForecast .hour-card .hour-extra, #tomorrowHourlyForecast .hour-card .hour-extra').forEach(line => {
      const text = line.textContent || '';
      if (!text.includes('💨')) return;

      const match = text.match(/(\d+)\s*km\/h/);
      if (!match) return;

      const speed = Number(match[1]);
      const category = windCategory(speed, lang);
      const wanted = `${lang}|${speed}|${category}`;

      if (line.dataset.windFormatted !== wanted) {
        line.innerHTML = `<span class="wind-speed">💨 ${speed} km/h</span><span class="wind-category">${category}</span>`;
        line.dataset.windFormatted = wanted;
      }
    });
  }

  window.windCategory = windCategory;
  window.updateHourlyWindLabels = updateHourlyWindLabels;

  updateHourlyWindLabels();
  setInterval(updateHourlyWindLabels, 1000);
})();
