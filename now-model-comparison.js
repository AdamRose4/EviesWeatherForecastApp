// Current-hour side-by-side comparison for all six forecast models.
(function () {
  function renderNowModels() {
    const host = document.getElementById('nowModelComparison');
    const timeLabel = document.getElementById('nowModelTime');
    if (!host) return;

    try {
      if (typeof state === 'undefined' || !state?.data?.hourly?.time?.length || typeof MODEL_DEFS === 'undefined') return;

      const now = new Date();
      const hourFloor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      let idx = state.data.hourly.time.findIndex(t => new Date(t) >= hourFloor);
      if (idx < 0) idx = 0;
      const timeKey = state.data.hourly.time[idx];
      const dt = new Date(timeKey);

      if (timeLabel) {
        timeLabel.textContent = `Current hour · ${dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
      }

      host.innerHTML = MODEL_DEFS.map(def => {
        const model = state.models.find(m => m.key === def.key);
        if (!model) {
          return `<div class="model-card unavailable"><b>${def.key}</b><span>Unavailable</span><small>${def.org}</small></div>`;
        }

        const i = model.data.hourly.time.indexOf(timeKey);
        if (i < 0) {
          return `<div class="model-card unavailable"><b>${def.key}</b><span>No data</span><small>${def.org}</small></div>`;
        }

        const temperature = model.data.hourly.temperature_2m?.[i];
        const precipitation = model.data.hourly.precipitation?.[i] ?? 0;
        const code = model.data.hourly.weather_code?.[i];
        const [description, icon] = weatherCodes[code] || ['Weather','🌤️'];
        const wet = precipitation >= 0.1;

        return `<div class="model-card">
          <b>${def.key}</b>
          <div class="model-icon">${icon}</div>
          <div class="model-temp">${temp(temperature)}</div>
          <small>${description}</small>
          <small>${wet ? 'Rain' : 'No rain'} · ${Number(precipitation).toFixed(1)} mm</small>
        </div>`;
      }).join('');
    } catch (_) {
      // The main app may still be loading model data; the interval below retries.
    }
  }

  renderNowModels();
  setInterval(renderNowModels, 1500);
})();
