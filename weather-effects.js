// Dynamic hero animation based on the same six-model consensus used by the "Now" tile.
// The hero also includes seasonal scenery: winter, spring, summer and autumn.
(function () {
  function weatherType(code) {
    if ([95,96,99].includes(code)) return 'storm';
    if ([71,73,75,77,85,86].includes(code)) return 'snow';
    if ([45,48].includes(code)) return 'fog';
    if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'rain';
    if ([1,2,3].includes(code)) return 'cloudy';
    return 'clear';
  }

  function currentSeason(date = new Date()) {
    const month = date.getMonth(); // 0 = Jan
    if (month === 11 || month <= 1) return 'winter';
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    return 'autumn';
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

  function seasonalMarkup(season) {
    if (season === 'winter') {
      return `<div class="season-layer season-winter">
        <div class="season-ground winter-ground"></div>
        <div class="snow-mound snow-mound-a"></div><div class="snow-mound snow-mound-b"></div>
        <span class="ambient-snow as1">❄</span><span class="ambient-snow as2">❄</span><span class="ambient-snow as3">❄</span><span class="ambient-snow as4">❄</span>
      </div>`;
    }
    if (season === 'spring') {
      return `<div class="season-layer season-spring">
        <div class="season-ground spring-ground"></div>
        <span class="grass-tuft gt1"></span><span class="grass-tuft gt2"></span><span class="grass-tuft gt3"></span>
        <span class="spring-flower sf1"></span><span class="spring-flower sf2"></span><span class="spring-flower sf3"></span><span class="spring-flower sf4"></span><span class="spring-flower sf5"></span>
      </div>`;
    }
    if (season === 'summer') {
      return `<div class="season-layer season-summer">
        <div class="season-ground summer-ground"></div>
        <div class="beach-umbrella"><div class="umbrella-canopy"></div><div class="umbrella-pole"></div></div>
        <span class="shell shell-a">◔</span><span class="shell shell-b">◡</span>
      </div>`;
    }
    return `<div class="season-layer season-autumn">
      <div class="season-ground autumn-ground"></div>
      <span class="ground-leaf gl1"></span><span class="ground-leaf gl2"></span><span class="ground-leaf gl3"></span><span class="ground-leaf gl4"></span><span class="ground-leaf gl5"></span>
      <span class="falling-leaf fl1">◆</span><span class="falling-leaf fl2">◆</span><span class="falling-leaf fl3">◆</span>
    </div>`;
  }

  function getAppState() {
    try { return typeof state !== 'undefined' ? state : null; }
    catch (_) { return null; }
  }

  function consensusWeatherCode(appState) {
    try {
      if (typeof consensusAt !== 'function' || !appState?.data?.hourly?.time?.length) {
        return Number(appState?.data?.current?.weather_code ?? 2);
      }
      const now = new Date();
      let idx = appState.data.hourly.time.findIndex(t =>
        new Date(t) >= new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
      );
      if (idx < 0) idx = 0;
      const c = consensusAt(appState.data.hourly.time[idx]);
      return Number(c?.code ?? appState.data.current.weather_code ?? 2);
    } catch (_) {
      return Number(appState?.data?.current?.weather_code ?? 2);
    }
  }

  function applyHeroWeather() {
    const appState = getAppState();
    if (!appState?.data?.current) return;

    const card = document.querySelector('.hero-card');
    const scene = document.getElementById('weatherScene');
    if (!card || !scene) return;

    const code = consensusWeatherCode(appState);
    const type = weatherType(code);
    const season = currentSeason();
    const night = isNight();

    card.classList.remove(
      'weather-clear','weather-cloudy','weather-rain','weather-snow','weather-fog','weather-storm','weather-night',
      'season-winter-card','season-spring-card','season-summer-card','season-autumn-card'
    );
    card.classList.add(`weather-${type}`, `season-${season}-card`);
    if (night) card.classList.add('weather-night');

    let html = seasonalMarkup(season);
    html += `<div class="live-weather-layer">`;
    if (night) html += `<div class="moon-disc"></div>${stars()}`;
    else if (type === 'clear' || type === 'cloudy') html += `<div class="sun-disc"></div>`;

    if (type === 'cloudy' || type === 'rain' || type === 'snow' || type === 'storm') {
      html += `<div class="scene-cloud back"></div><div class="scene-cloud front"></div>`;
    }
    if (type === 'rain') html += drops(26,'rain-drop');
    if (type === 'storm') html += drops(32,'rain-drop') + `<div class="lightning"></div>`;
    if (type === 'snow') html += drops(24,'snow-flake','❄');
    if (type === 'fog') html += `<div class="fog-bank" style="top:22%"></div><div class="fog-bank" style="top:37%;animation-delay:-4s"></div><div class="fog-bank" style="top:52%;animation-delay:-7s"></div>`;
    if (type === 'clear' && !night) html += `<div class="scene-cloud back"></div>`;
    html += `</div>`;

    scene.innerHTML = html;
  }

  const originalRender = typeof render === 'function' ? render : null;
  if (originalRender) {
    window.render = function () {
      originalRender.apply(this, arguments);
      applyHeroWeather();
    };
  }

  window.applyHeroWeather = applyHeroWeather;

  let tries = 0;
  const starter = setInterval(() => {
    tries += 1;
    const appState = getAppState();
    if (appState?.data?.current) {
      applyHeroWeather();
      clearInterval(starter);
    } else if (tries >= 40) clearInterval(starter);
  }, 250);
})();
