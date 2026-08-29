// Hourly card presentation overrides for Evie's Weather Forecasting App.
// Rain likelihood colours: High = red, Medium = yellow, Low = green.

renderHourlyCard = function(timeKey, label) {
  const c = consensusAt(timeKey);
  if (!c) return '';

  const w = weatherCodes[c.code] || ['Weather','🌤️'];
  const extra = baseHourlyAt(timeKey);
  const availabilityText = c.available === MODEL_DEFS.length
    ? `${c.rainCount}/${c.available} rain`
    : `${c.rainCount}/${c.available} available rain`;
  const missingTitle = c.missing.length
    ? `Missing for this hour: ${c.missing.join(', ')}`
    : 'All 6 sources contributed';

  return `<div class="hour-card" title="${missingTitle}">
    <div class="time">${label}</div>
    <div class="icon">${w[1]}</div>
    <strong>${temp(c.averageTemp)}</strong>
    <div class="hour-confidence ${c.cls}"><i class="confidence-dot ${c.cls}"></i>${c.label}</div>
    <div class="model-vote">${availabilityText}</div>
    <div class="hour-extra nowrap">💨 Wind ${Number.isFinite(extra.wind) ? Math.round(extra.wind) + ' km/h' : '—'}</div>
    <div class="hour-extra nowrap">☀️ UV ${uvLabel(extra.uv)}</div>
  </div>`;
};

function refreshRainKeys() {
  document.querySelectorAll('.confidence-key').forEach(key => {
    key.innerHTML = `
      <span><i class="confidence-dot high"></i><strong>Red</strong> High rain likelihood (5–6 models)</span>
      <span><i class="confidence-dot medium"></i><strong>Yellow</strong> Medium rain likelihood (3–4 models)</span>
      <span><i class="confidence-dot low"></i><strong>Green</strong> Low rain likelihood (0–2 models)</span>`;
  });
}

refreshRainKeys();
if (state.data) render();
