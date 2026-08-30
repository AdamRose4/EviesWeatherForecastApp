(function(){
  function getState(){
    try { return typeof state !== 'undefined' ? state : null; }
    catch (_) { return null; }
  }

  function updateRadarLink(){
    const btn = document.getElementById('radarForecastBtn');
    if (!btn) return;
    const s = getState();
    const lat = Number(s?.latitude ?? 51.8642);
    const lon = Number(s?.longitude ?? -2.2382);
    const name = s?.location || document.getElementById('locationName')?.textContent || 'Gloucester, United Kingdom';
    const payload = {lat, lon, name};
    localStorage.setItem('evieRadarLocation', JSON.stringify(payload));
    btn.href = `radar.html?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&name=${encodeURIComponent(name)}`;
  }

  document.addEventListener('click', e => {
    if (e.target.closest('#radarForecastBtn')) updateRadarLink();
  });

  setInterval(updateRadarLink, 1000);
  updateRadarLink();
})();
