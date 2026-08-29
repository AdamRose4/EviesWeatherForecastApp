// Dynamic hero animation based on the current Open-Meteo weather code.
(function () {
  function weatherType(code) {
    if ([95,96,99].includes(code)) return 'storm';
    if ([71,73,75,77,85,86].includes(code)) return 'snow';
    if ([45,48].includes(code)) return 'fog';
    if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'rain';
    if ([1,2,3].includes(code)) return 'cloudy';
    return 'clear';
  }

  function isNight() {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 20;
  }

  function drops(count, cls, symbol='') {
    return Array.from({length:count}, (_,i) => {
      const left = (i * 13.7 + 7) % 100;
      const delay = -((i * .37) % 3.2);
      const duration = 1.05 + ((i * .17) % .9);
      return `<span class="${cls}" style="left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s">${symbol}</span>`;
    }).join('');
  }

  function stars(count=18) {
    return Array.from({length:count}, (_,i) => {
      const left = (i * 17.3 + 4) % 91;
      const top = (i * 29.7 + 7) % 54;
      const delay = -((i * .41) % 2.5);
      return `<span class="star" style="left:${left}%;top:${top}%;animation-delay:${delay}s"></span>`;
    }).join('');
  }

  function applyHeroWeather() {
    if (!window.state?.data?.current) return;
    const card = document.querySelector('.hero-card');
    const scene = document.getElementById('weatherScene');
    const icon = document.getElementById('weatherIcon');
    if (!card || !scene) return;

    const code = Number(state.data.current.weather_code);
    const type = weatherType(code);
    const night = isNight();
    card.classList.remove('weather-clear','weather-cloudy','weather-rain','weather-snow','weather-fog','weather-storm','weather-night');
    card.classList.add(`weather-${type}`);
    if (night) card.classList.add('weather-night');

    let html = '';
    if (night) html += `<div class="moon-disc"></div>${stars()}`;
    else if (type === 'clear' || type === 'cloudy' || type === 'rain') html += `<div class="sun-disc"></div>`;

    if (type === 'cloudy' || type === 'rain' || type === 'snow' || type === 'storm') {
      html += `<div class="scene-cloud back">☁️</div><div class="scene-cloud">${type === 'storm' ? '🌩️' : '☁️'}</div>`;
    }
    if (type === 'rain') html += drops(26,'rain-drop');
    if (type === 'storm') html += drops(32,'rain-drop') + `<div class="lightning"></div>`;
    if (type === 'snow') html += drops(24,'snow-flake','❄');
    if (type === 'fog') html += `<div class="fog-bank" style="top:22%"></div><div class="fog-bank" style="top:37%;animation-delay:-4s"></div><div class="fog-bank" style="top:52%;animation-delay:-7s"></div>`;
    if (type === 'clear' && !night) html += `<div class="scene-cloud back">☁️</div>`;

    scene.innerHTML = html;
    if (icon) icon.style.animation = (type === 'rain' || type === 'cloudy') ? 'cloudFloat 6s ease-in-out infinite' : 'none';
  }

  const originalRender = window.render;
  if (typeof originalRender === 'function') {
    window.render = function () {
      originalRender.apply(this, arguments);
      applyHeroWeather();
    };
  }

  window.applyHeroWeather = applyHeroWeather;
  if (window.state?.data) applyHeroWeather();
})();
