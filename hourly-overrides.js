// Hourly card presentation overrides for Evie's Weather Forecasting App.
// The rain model count itself carries the colour signal to keep the tiles compact.

renderHourlyCard = function(timeKey, label) {
  const c = consensusAt(timeKey);
  if (!c) return '';

  const w = weatherCodes[c.code] || ['Weather','🌤️'];
  const extra = baseHourlyAt(timeKey);
  const availabilityText = c.available === MODEL_DEFS.length
    ? `${c.wetCount}/${c.available} rain`
    : `${c.wetCount}/${c.available} available rain`;
  const missingTitle = c.missing.length
    ? `Missing for this hour: ${c.missing.join(', ')}`
    : 'All 6 sources contributed';

  return `<div class="hour-card" title="${missingTitle}">
    <div class="time">${label}</div>
    <div class="icon">${w[1]}</div>
    <strong>${temp(c.averageTemp)}</strong>
    <div class="model-vote ${c.cls}">${availabilityText}</div>
    <div class="hour-extra nowrap">💨 Wind ${Number.isFinite(extra.wind) ? Math.round(extra.wind) + ' km/h' : '—'}</div>
    <div class="hour-extra nowrap">☀️ UV ${uvLabel(extra.uv)}</div>
  </div>`;
};

function refreshRainKeys() {
  document.querySelectorAll('.confidence-key').forEach(key => {
    key.innerHTML = `
      <span>🔴 <strong>1–2/6 rain</strong></span>
      <span>🟡 <strong>3–4/6 rain</strong></span>
      <span>🟢 <strong>5–6/6 rain</strong></span>`;
  });
}

refreshRainKeys();
if (state.data) render();
