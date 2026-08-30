(function(){
  const params = new URLSearchParams(location.search);
  const saved = JSON.parse(localStorage.getItem('evieRadarLocation') || '{}');
  const lat = Number(params.get('lat') ?? saved.lat ?? 51.8642);
  const lon = Number(params.get('lon') ?? saved.lon ?? -2.2382);
  const name = params.get('name') || saved.name || 'Gloucester, United Kingdom';

  const iframe = document.getElementById('forecastMap');
  const slider = document.getElementById('timeSlider');
  const timeLabel = document.getElementById('forecastTime');
  const offsetLabel = document.getElementById('forecastOffset');
  const playBtn = document.getElementById('playBtn');
  const placeName = document.getElementById('placeName');
  const layerBtns = [...document.querySelectorAll('.layer-btn')];

  let layer = 'rain-3h';
  let timer = null;

  placeName.textContent = name;
  localStorage.setItem('evieRadarLocation', JSON.stringify({lat, lon, name}));

  function roundedUtcNow(){
    const d = new Date();
    d.setUTCMinutes(0,0,0);
    return d;
  }

  function targetDate(hours){
    return new Date(roundedUtcNow().getTime() + Number(hours) * 3600000);
  }

  function ventuskyTime(d){
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth()+1).padStart(2,'0');
    const day = String(d.getUTCDate()).padStart(2,'0');
    const h = String(d.getUTCHours()).padStart(2,'0');
    return `${y}${m}${day}/${h}`;
  }

  function displayTime(d){
    return d.toLocaleString([], {weekday:'short', hour:'2-digit', minute:'2-digit'});
  }

  function mapUrl(){
    const hours = Number(slider.value);
    const t = ventuskyTime(targetDate(hours));
    return `https://embed.ventusky.com/?p=${lat.toFixed(4)};${lon.toFixed(4)};8&l=${encodeURIComponent(layer)}&t=${t}`;
  }

  function renderMap(){
    const hours = Number(slider.value);
    const d = targetDate(hours);
    timeLabel.textContent = hours === 0 ? `Now · ${displayTime(d)}` : displayTime(d);
    offsetLabel.textContent = hours === 0 ? 'NOW' : `+${hours}H`;
    iframe.src = mapUrl();
  }

  function stop(){
    clearInterval(timer); timer = null; playBtn.textContent = '▶ Play';
  }

  slider.addEventListener('input', () => { stop(); renderMap(); });

  layerBtns.forEach(btn => btn.addEventListener('click', () => {
    layerBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    layer = btn.dataset.layer;
    renderMap();
  }));

  playBtn.addEventListener('click', () => {
    if (timer) { stop(); return; }
    playBtn.textContent = '❚❚ Pause';
    timer = setInterval(() => {
      let next = Number(slider.value) + 1;
      if (next > 24) next = 0;
      slider.value = String(next);
      renderMap();
    }, 1400);
  });

  renderMap();
})();
