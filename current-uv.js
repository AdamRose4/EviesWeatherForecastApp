// Keeps the hero's Current UV card in sync with the corrected hourly UV feed.
(function () {
  function uvCategory(value) {
    const uv = Math.max(0, Math.round(Number(value)));
    if (!Number.isFinite(uv)) return { value: '—', label: '—' };
    if (uv >= 11) return { value: uv, label: 'Extreme' };
    if (uv >= 8) return { value: uv, label: 'Very High' };
    if (uv >= 6) return { value: uv, label: 'High' };
    if (uv >= 3) return { value: uv, label: 'Moderate' };
    return { value: uv, label: 'Low' };
  }

  function updateCurrentUv() {
    const target = document.getElementById('currentUv');
    if (!target || typeof state === 'undefined' || !state.data?.hourly?.time?.length) return;

    const now = new Date();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    let index = state.data.hourly.time.findIndex(t => new Date(t) >= hourStart);
    if (index < 0) index = 0;

    const uv = state.data.hourly.uv_index?.[index];
    const result = uvCategory(uv);
    target.textContent = result.value === '—' ? '—' : `${result.value} · ${result.label}`;
  }

  window.updateCurrentUv = updateCurrentUv;
  updateCurrentUv();
  setInterval(updateCurrentUv, 1000);
})();
