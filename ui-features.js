// Favourites and English/Slovak localisation for Evie's Weather Forecasting App.
(function () {
  const FAV_KEY = 'eviesWeatherFavourites';
  const LANG_KEY = 'eviesWeatherLanguage';

  const text = {
    en: {
      title: "Evie's Weather Forecasting App",
      tagline: 'Six weather models. One clearer forecast.',
      searchPlaceholder: 'Search town, city or postcode…',
      search: 'Search',
      useLocation: '⌖ Use my location',
      addFavourite: '＋ Add current location',
      favourites: '★ Favourites',
      noFavourites: 'No favourites yet',
      comparing: 'Comparing weather models…',
      consensusNow: 'CONSENSUS NOW',
      feelsLike: 'Feels like',
      rainLikelihood: 'Rain likelihood',
      humidity: 'Humidity',
      wind: 'Wind',
      rainNow: 'Rain now',
      modelsLive: 'Models live',
      averaged: 'AVERAGED',
      next24: 'Next 24 hours',
      tomorrow: 'TOMORROW',
      tomorrowHourly: 'Tomorrow hour by hour',
      sideBySide: 'SIDE BY SIDE',
      modelTomorrow: 'What each model says tomorrow',
      modelExplain: 'A model counts as predicting “rain” when it forecasts measurable precipitation during the day. This avoids pretending that different probability systems are directly identical.',
      modelConsensus: 'MODEL CONSENSUS',
      sevenDay: '7-day forecast',
      day: 'Day', weather: 'Weather', consensusForecast: 'Consensus forecast', highLow: 'High / Low',
      sourceIndex: 'SOURCE INDEX',
      accuracyTitle: 'Forecast sources & recent accuracy',
      accuracyWindow: '14-day local back-test',
      accuracyIntro: 'Each model is back-tested locally using its archived 24-hour-ahead forecasts. The score combines temperature accuracy and correct rain/dry-day calls over the previous 14 complete days.',
      accuracyLoading: 'Calculating local forecast accuracy…',
      footer: "Forecast data via Open-Meteo. Evie's Weather Forecasting App is independent of the listed forecast organisations.",
      today: 'Today', now: 'Now', rain: 'Rain', noRain: 'No rain', low: 'Low', medium: 'Medium', high: 'High',
      calm: 'Calm', breeze: 'Breeze', strongBreeze: 'Strong Breeze', gale: 'Gale', strongGale: 'Strong Gale',
      removeFavourite: 'Remove favourite'
    },
    sk: {
      title: 'Evie – aplikácia na predpoveď počasia',
      tagline: 'Šesť modelov počasia. Jedna jasnejšia predpoveď.',
      searchPlaceholder: 'Vyhľadajte mesto, obec alebo PSČ…',
      search: 'Hľadať',
      useLocation: '⌖ Použiť moju polohu',
      addFavourite: '＋ Pridať aktuálne miesto',
      favourites: '★ Obľúbené',
      noFavourites: 'Zatiaľ žiadne obľúbené miesta',
      comparing: 'Porovnávam modely počasia…',
      consensusNow: 'AKTUÁLNY KONSENZUS',
      feelsLike: 'Pocitová teplota',
      rainLikelihood: 'Pravdepodobnosť dažďa',
      humidity: 'Vlhkosť',
      wind: 'Vietor',
      rainNow: 'Dážď teraz',
      modelsLive: 'Aktívne modely',
      averaged: 'PRIEMER',
      next24: 'Nasledujúcich 24 hodín',
      tomorrow: 'ZAJTRA',
      tomorrowHourly: 'Zajtra hodinu po hodine',
      sideBySide: 'POROVNANIE',
      modelTomorrow: 'Čo hovoria jednotlivé modely na zajtra',
      modelExplain: 'Model sa počíta ako daždivý, keď počas dňa predpovedá merateľné zrážky. Takto sa nepredstiera, že rôzne systémy pravdepodobnosti sú priamo totožné.',
      modelConsensus: 'KONSENZUS MODELOV',
      sevenDay: '7-dňová predpoveď',
      day: 'Deň', weather: 'Počasie', consensusForecast: 'Konsenzus predpovede', highLow: 'Max / Min',
      sourceIndex: 'ZDROJE',
      accuracyTitle: 'Zdroje predpovede a nedávna presnosť',
      accuracyWindow: '14-dňové lokálne spätné testovanie',
      accuracyIntro: 'Každý model sa lokálne spätne testuje pomocou archivovaných predpovedí na 24 hodín dopredu. Skóre kombinuje presnosť teploty a správne určenie daždivého alebo suchého dňa za posledných 14 úplných dní.',
      accuracyLoading: 'Počítam lokálnu presnosť predpovede…',
      footer: 'Údaje o predpovedi poskytuje Open-Meteo. Evie – aplikácia na predpoveď počasia je nezávislá od uvedených meteorologických organizácií.',
      today: 'Dnes', now: 'Teraz', rain: 'Dážď', noRain: 'Bez dažďa', low: 'Nízka', medium: 'Stredná', high: 'Vysoká',
      calm: 'Bezvetrie', breeze: 'Vánok', strongBreeze: 'Silný vietor', gale: 'Víchrica', strongGale: 'Silná víchrica',
      removeFavourite: 'Odstrániť z obľúbených'
    }
  };

  const weatherSk = {
    'Clear sky':'Jasno','Mainly clear':'Prevažne jasno','Partly cloudy':'Polooblačno','Overcast':'Zamračené',
    'Fog':'Hmla','Rime fog':'Mrznúca hmla','Light drizzle':'Slabé mrholenie','Drizzle':'Mrholenie','Heavy drizzle':'Silné mrholenie',
    'Freezing drizzle':'Mrznúce mrholenie','Light rain':'Slabý dážď','Rain':'Dážď','Heavy rain':'Silný dážď','Freezing rain':'Mrznúci dážď',
    'Light snow':'Slabé sneženie','Snow':'Sneženie','Heavy snow':'Silné sneženie','Snow grains':'Snehové zrná',
    'Rain showers':'Dažďové prehánky','Heavy showers':'Silné prehánky','Snow showers':'Snehové prehánky','Heavy snow showers':'Silné snehové prehánky',
    'Thunderstorm':'Búrka','Thunderstorm / hail':'Búrka s krúpami','Weather':'Počasie'
  };

  let language = localStorage.getItem(LANG_KEY) === 'sk' ? 'sk' : 'en';

  function t(key) { return text[language][key] || text.en[key] || key; }
  function getState() { try { return typeof state !== 'undefined' ? state : null; } catch (_) { return null; } }
  function getFavourites() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch (_) { return []; } }
  function saveFavourites(items) { localStorage.setItem(FAV_KEY, JSON.stringify(items)); }

  function renderFavourites() {
    const list = document.getElementById('favouritesList');
    const empty = document.getElementById('favouritesEmpty');
    if (!list || !empty) return;
    const items = getFavourites();
    empty.style.display = items.length ? 'none' : 'inline';
    list.innerHTML = items.map((fav, i) => `<button class="favourite-chip" data-fav-index="${i}" title="${fav.name}"><span>★ ${fav.name}</span><b class="favourite-remove" data-remove-fav="${i}" title="${t('removeFavourite')}">×</b></button>`).join('');
  }

  function addCurrentFavourite() {
    const s = getState();
    if (!s || !Number.isFinite(Number(s.latitude)) || !Number.isFinite(Number(s.longitude))) return;
    const items = getFavourites();
    const duplicate = items.some(x => Math.abs(x.lat - Number(s.latitude)) < .0001 && Math.abs(x.lon - Number(s.longitude)) < .0001);
    if (!duplicate) items.push({ name: s.location || 'Location', lat: Number(s.latitude), lon: Number(s.longitude) });
    saveFavourites(items);
    renderFavourites();
  }

  function loadFavourite(index) {
    const fav = getFavourites()[index];
    const s = getState();
    if (!fav || !s || typeof fetchWeather !== 'function') return;
    s.latitude = fav.lat; s.longitude = fav.lon; s.location = fav.name;
    const input = document.getElementById('searchInput'); if (input) input.value = fav.name;
    fetchWeather(fav.lat, fav.lon);
  }

  function removeFavourite(index) {
    const items = getFavourites(); items.splice(index, 1); saveFavourites(items); renderFavourites();
  }

  function setStaticText() {
    document.documentElement.lang = language === 'sk' ? 'sk' : 'en';
    const byId = {
      appTitle:'title', appTagline:'tagline', searchBtn:'search', locationBtn:'useLocation', addFavouriteBtn:'addFavourite', favouritesLabel:'favourites', favouritesEmpty:'noFavourites', loading:'comparing', accuracyWindow:'accuracyWindow'
    };
    Object.entries(byId).forEach(([id,key]) => { const el=document.getElementById(id); if (el && !el.classList.contains('hidden') || el) el.textContent=t(key); });
    const input = document.getElementById('searchInput'); if (input) input.placeholder=t('searchPlaceholder');
    const langBtn = document.getElementById('langBtn'); if (langBtn) langBtn.textContent = language === 'en' ? 'SK' : 'EN';

    const q = (sel) => document.querySelector(sel);
    const set = (sel,val) => { const el=q(sel); if(el) el.textContent=val; };
    set('.consensus-label', t('consensusNow'));
    const statLabels = document.querySelectorAll('.hero-stats-grid .stat small');
    [t('rainLikelihood'),t('humidity'),t('wind'),t('rainNow'),t('modelsLive')].forEach((v,i)=>{if(statLabels[i]) statLabels[i].textContent=v;});
    const heads = document.querySelectorAll('.section-heading');
    if (heads[0]) { heads[0].querySelector('.kicker').textContent=t('averaged'); heads[0].querySelector('h3').textContent=t('next24'); }
    if (heads[1]) { heads[1].querySelector('.kicker').textContent=t('tomorrow'); heads[1].querySelector('h3').textContent=t('tomorrowHourly'); }
    if (heads[2]) { heads[2].querySelector('.kicker').textContent=t('sideBySide'); heads[2].querySelector('h3').textContent=t('modelTomorrow'); }
    if (heads[3]) { heads[3].querySelector('.kicker').textContent=t('modelConsensus'); heads[3].querySelector('h3').textContent=t('sevenDay'); }
    if (heads[4]) { heads[4].querySelector('.kicker').textContent=t('sourceIndex'); heads[4].querySelector('h3').textContent=t('accuracyTitle'); }
    const explain = document.querySelectorAll('.section-card .explain'); if (explain[0]) explain[0].textContent=t('modelExplain');
    const intro = document.querySelector('.accuracy-intro'); if(intro) intro.textContent=t('accuracyIntro');
    const dh = document.querySelectorAll('.daily-header > div'); [t('day'),t('weather'),t('consensusForecast'),t('rainLikelihood'),t('highLow')].forEach((v,i)=>{if(dh[i]) dh[i].textContent=v;});
    const footer=document.querySelector('footer'); if(footer) footer.textContent=t('footer');
  }

  function translateDynamic() {
    const feels=document.getElementById('feelsLike');
    if (feels && feels.textContent.includes('°')) feels.textContent = `${t('feelsLike')} ${feels.textContent.match(/-?\d+°/)?.[0] || '—'}`;
    const condition=document.getElementById('condition');
    if(condition) {
      if (!condition.dataset.enText && weatherSk[condition.textContent]) condition.dataset.enText=condition.textContent;
      condition.textContent = language==='sk' ? (weatherSk[condition.dataset.enText || condition.textContent] || condition.textContent) : (condition.dataset.enText || condition.textContent);
    }
    document.querySelectorAll('.day-weather small').forEach(el=>{
      if(!el.dataset.enText && weatherSk[el.textContent]) el.dataset.enText=el.textContent;
      el.textContent = language==='sk' ? (weatherSk[el.dataset.enText || el.textContent] || el.textContent) : (el.dataset.enText || el.textContent);
    });
    document.querySelectorAll('.hour-card .time').forEach(el=>{ if(el.textContent==='Now'||el.textContent==='Teraz') el.textContent=t('now'); });
    document.querySelectorAll('.day-row .day').forEach(el=>{ if(el.textContent==='Today'||el.textContent==='Dnes') el.textContent=t('today'); });
    document.querySelectorAll('.model-card small').forEach(el=>{
      if(!el.dataset.enText) el.dataset.enText=el.textContent;
      if(language==='en') el.textContent=el.dataset.enText;
      else el.textContent=el.dataset.enText.replace(/^No rain/,t('noRain')).replace(/^Rain/,t('rain'));
    });
    document.querySelectorAll('.daily-confidence').forEach(el=>{
      const key=el.classList.contains('high')?'high':el.classList.contains('medium')?'medium':'low';
      const dot=el.querySelector('i'); el.textContent=''; if(dot) el.appendChild(dot); el.append(document.createTextNode(t(key)));
    });
    document.querySelectorAll('.wind-category').forEach(el=>{
      const en=el.dataset.enText || el.textContent; if(!el.dataset.enText) el.dataset.enText=en;
      const map={'Calm':'calm','Breeze':'breeze','Strong Breeze':'strongBreeze','Gale':'gale','Strong Gale':'strongGale'};
      el.textContent = language==='sk' && map[en] ? t(map[en]) : en;
    });
  }

  function applyLanguage() { setStaticText(); translateDynamic(); renderFavourites(); }

  document.getElementById('langBtn')?.addEventListener('click', () => {
    language = language === 'en' ? 'sk' : 'en'; localStorage.setItem(LANG_KEY, language); applyLanguage();
  });
  document.getElementById('addFavouriteBtn')?.addEventListener('click', addCurrentFavourite);
  document.getElementById('favouritesList')?.addEventListener('click', e => {
    const remove=e.target.closest('[data-remove-fav]'); if(remove){ e.stopPropagation(); removeFavourite(Number(remove.dataset.removeFav)); return; }
    const chip=e.target.closest('[data-fav-index]'); if(chip) loadFavourite(Number(chip.dataset.favIndex));
  });

  window.getEviesLanguage = () => language;
  window.applyEviesLanguage = applyLanguage;
  applyLanguage();
  setInterval(() => { translateDynamic(); renderFavourites(); }, 1200);
})();
