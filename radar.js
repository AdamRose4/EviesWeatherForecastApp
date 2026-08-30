(function(){
  const params = new URLSearchParams(location.search);
  const saved = JSON.parse(localStorage.getItem('evieRadarLocation') || '{}');
  const lat = Number(params.get('lat') ?? saved.lat ?? 51.8642);
  const lon = Number(params.get('lon') ?? saved.lon ?? -2.2382);
  const name = params.get('name') || saved.name || 'Gloucester, United Kingdom';

  const iframe = document.getElementById('forecastMap');
  const placeName = document.getElementById('placeName');

  placeName.textContent = name;
  localStorage.setItem('evieRadarLocation', JSON.stringify({lat, lon, name}));

  const mapUrl = `https://embed.ventusky.com/?p=${lat.toFixed(4)};${lon.toFixed(4)};8&l=clouds-total`;
  iframe.src = mapUrl;
})();
