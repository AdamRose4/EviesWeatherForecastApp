// Hourly card presentation overrides for Evie's Weather App.
// The rain model count itself carries the colour signal to keep the tiles compact.

renderHourlyCard = function(timeKey, label) {
  const c = consensusAt(timeKey);
  const extra = baseHourlyAt(timeKey);
  if (!c && !Number.isFinite(extra.temperature)) return '';

  const code = c?.code ?? extra.code;
  const displayTemperature = c?.averageTemp ?? extra.temperature;
  const w = weatherCodes[code] || ['Weather','🌤️'];
  const availabilityText = c
    ? (c.available === MODEL_DEFS.length
      ? `${c.wetCount}/${c.available} rain`
      : `${c.wetCount}/${c.available} available rain`)
    : `${Number(extra.precipitation ?? 0).toFixed(1)} mm rain`;
  const missingTitle = c
    ? (c.missing.length
      ? `Missing for this hour: ${c.missing.join(', ')}`
      : 'All 6 sources contributed')
    : 'Blended forecast; individual model comparison unavailable';
  const likelihoodClass = c?.cls ?? ((extra.precipitation ?? 0) >= 0.1 ? 'medium' : 'low');

  return `<div class="hour-card" title="${missingTitle}">
    <div class="time">${label}</div>
    <div class="icon">${w[1]}</div>
    <strong>${temp(displayTemperature)}</strong>
    <div class="model-vote ${likelihoodClass}">${availabilityText}</div>
    <div class="hour-extra nowrap">💨 Wind ${Number.isFinite(extra.wind) ? Math.round(extra.wind) + ' km/h' : '—'}</div>
    <div class="hour-extra nowrap">☀️ UV ${uvLabel(extra.uv)}</div>
  </div>`;
};

function refreshRainKeys() {
  document.querySelectorAll('.confidence-key').forEach(key => {
    key.innerHTML = `
      <span>🟢 <strong>1–2/6 rain</strong></span>
      <span>🟡 <strong>3–4/6 rain</strong></span>
      <span>🔴 <strong>5–6/6 rain</strong></span>`;
  });
}

refreshRainKeys();
if (state.data) render();
