const $ = (id) => document.getElementById(id);

const state = {
  unit: 'C',
  latitude: 51.8642,
  longitude: -2.2382,
  location: 'Gloucester, United Kingdom',
  data: null,
  models: []
};

const MODEL_DEFS = [
  { key:'UKMO', org:'UK Met Office', model:'UKMO Seamless (UKV 2 km + Global)', api:'ukmo_seamless', days:7 },
  { key:'ECMWF', org:'ECMWF', model:'IFS', api:'ecmwf_ifs025', days:8 },
  { key:'ICON', org:'Deutscher Wetterdienst (DWD)', model:'ICON Seamless', api:'icon_seamless', days:8 },
  { key:'GFS', org:'NOAA / NCEP', model:'GFS Seamless', api:'ncep_gfs_seamless', days:8 },
  { key:'ARPEGE', org:'Météo-France', model:'ARPEGE Europe', api:'meteofrance_arpege_europe', days:4 },
  { key:'KNMI', org:'KNMI', model:'HARMONIE-AROME Europe', api:'knmi_harmonie_arome_europe', days:3 }
];

const weatherCodes = {
  0: ['Clear sky','☀️'], 1: ['Mainly clear','🌤️'], 2: ['Partly cloudy','⛅'], 3: ['Overcast','☁️'],
  45: ['Fog','🌫️'], 48: ['Rime fog','🌫️'], 51: ['Light drizzle','🌦️'], 53: ['Drizzle','🌦️'], 55: ['Heavy drizzle','🌧️'],
  56: ['Freezing drizzle','🌧️'], 57: ['Freezing drizzle','🌧️'], 61: ['Light rain','🌦️'], 63: ['Rain','🌧️'], 65: ['Heavy rain','🌧️'],
  66: ['Freezing rain','🌧️'], 67: ['Freezing rain','🌧️'], 71: ['Light snow','🌨️'], 73: ['Snow','❄️'], 75: ['Heavy snow','❄️'],
  77: ['Snow grains','🌨️'], 80: ['Rain showers','🌦️'], 81: ['Rain showers','🌧️'], 82: ['Heavy showers','⛈️'],
  85: ['Snow showers','🌨️'], 86: ['Heavy snow showers','❄️'], 95: ['Thunderstorm','⛈️'], 96: ['Thunderstorm / hail','⛈️'], 99: ['Thunderstorm / hail','⛈️']
};

const cToF = c => (c * 9/5) + 32;
const temp = c => c == null ? '—' : `${Math.round(state.unit === 'C' ? c : cToF(c))}°`;
const mean = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null;
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

function setStatus(type, message='') {
  $('loading').classList.add('hidden');
  $('error').classList.add('hidden');
  if (type === 'loading') $('loading').classList.remove('hidden');
  if (type === 'error') { $('error').textContent = message; $('error').classList.remove('hidden'); }
}

async function geocode(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Location search failed.');
  return (await res.json()).results || [];
}

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;
    const res = await fetch(url);
    const json = await res.json();
    const r = json.results?.[0];
    return r ? [r.name, r.admin1, r.country].filter(Boolean).join(', ') : 'Current location';
  } catch { return 'Current location'; }
}

async function fetchBaseWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon, timezone: 'auto', forecast_days: 8,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max'
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Weather service unavailable.');
  return res.json();
}

async function fetchModel(def, lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    forecast_days: def.days,
    hourly: 'temperature_2m,precipitation,weather_code',
    models: def.api
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`${def.key} unavailable`);
  const data = await res.json();
  if (!data.hourly?.time?.length) throw new Error(`${def.key} returned no hourly data`);
  return { ...def, data };
}

async function fetchWeather(lat, lon) {
  setStatus('loading');
  $('weatherContent').classList.add('hidden');
  try {
    const [base, settled] = await Promise.all([
      fetchBaseWeather(lat, lon),
      Promise.allSettled(MODEL_DEFS.map(def => fetchModel(def, lat, lon)))
    ]);
    state.data = base;
    state.models = settled.filter(x => x.status === 'fulfilled').map(x => x.value);
    render();
    setStatus();
    $('weatherContent').classList.remove('hidden');
  } catch (e) {
    setStatus('error', e.message || 'Unable to load weather.');
  }
}

function modelPoint(model, timeKey) {
  const i = model.data.hourly.time.indexOf(timeKey);
  if (i < 0) return null;
  const temperature = model.data.hourly.temperature_2m?.[i];
  const precipitation = model.data.hourly.precipitation?.[i];
  const code = model.data.hourly.weather_code?.[i];
  if (temperature == null && precipitation == null && code == null) return null;
  return { model, temperature, precipitation: precipitation ?? 0, code };
}

function consensusAt(timeKey) {
  const points = state.models.map(m => modelPoint(m, timeKey)).filter(Boolean);
  if (!points.length) return null;
  const temps = points.map(p=>p.temperature).filter(Number.isFinite);
  const wetCount = points.filter(p => (p.precipitation ?? 0) >= 0.1).length;
  const available = points.length;
  const dryCount = available - wetCount;
  const voteAgreement = Math.max(wetCount, dryCount) / available;
  const spread = temps.length ? Math.max(...temps) - Math.min(...temps) : 99;
  let cls = 'low', label = 'Low';
  if (available >= 5 && voteAgreement >= .80 && spread <= 2.5) { cls='high'; label='High'; }
  else if (available >= 4 && voteAgreement >= .67 && spread <= 4) { cls='medium'; label='Medium'; }
  const codes = points.map(p=>p.code).filter(Number.isFinite);
  const code = codes.length ? codes.sort((a,b)=>a-b)[Math.floor(codes.length/2)] : 2;
  return {
    points,
    available,
    wetCount,
    wetPercent: Math.round(100 * wetCount / available),
    averageTemp: mean(temps),
    code,
    spread,
    cls,
    label,
    missing: MODEL_DEFS.filter(def => !points.some(p=>p.model.key===def.key)).map(d=>d.key)
  };
}

function aggregateModelDay(model, dateKey) {
  const rows = model.data.hourly.time.map((t,i)=>({t,i})).filter(x=>x.t.startsWith(dateKey));
  if (!rows.length) return null;
  const temps = rows.map(x=>model.data.hourly.temperature_2m?.[x.i]).filter(Number.isFinite);
  const rain = rows.reduce((s,x)=>s+(model.data.hourly.precipitation?.[x.i] ?? 0),0);
  const noon = rows.find(x=>x.t.endsWith('12:00')) || rows[Math.floor(rows.length/2)];
  return {
    model,
    high: temps.length ? Math.max(...temps) : null,
    low: temps.length ? Math.min(...temps) : null,
    rain,
    wet: rain >= 0.2,
    code: model.data.hourly.weather_code?.[noon.i] ?? 2
  };
}

function dayConsensus(dateKey) {
  const rows = state.models.map(m=>aggregateModelDay(m,dateKey)).filter(Boolean);
  if (!rows.length) return null;
  const highs = rows.map(r=>r.high).filter(Number.isFinite);
  const lows = rows.map(r=>r.low).filter(Number.isFinite);
  const wetCount = rows.filter(r=>r.wet).length;
  const available = rows.length;
  const voteAgreement = Math.max(wetCount, available-wetCount)/available;
  const highSpread = highs.length ? Math.max(...highs)-Math.min(...highs) : 99;
  let cls='low', label='Low';
  if (available >= 5 && voteAgreement >= .8 && highSpread <= 3) { cls='high'; label='High'; }
  else if (available >= 4 && voteAgreement >= .67 && highSpread <= 5) { cls='medium'; label='Medium'; }
  const codes = rows.map(r=>r.code).filter(Number.isFinite).sort((a,b)=>a-b);
  return { rows, available, wetCount, wetPercent:Math.round(100*wetCount/available), high:mean(highs), low:mean(lows), code:codes[Math.floor(codes.length/2)] ?? 2, cls, label };
}

function renderHourlyCard(timeKey, label) {
  const c = consensusAt(timeKey);
  if (!c) return '';
  const w = weatherCodes[c.code] || ['Weather','🌤️'];
  const availabilityText = c.available === MODEL_DEFS.length ? `${c.wetCount}/${c.available} wet` : `${c.wetCount}/${c.available} available wet`;
  const missingTitle = c.missing.length ? `Missing for this hour: ${c.missing.join(', ')}` : 'All 6 sources contributed';
  return `<div class="hour-card" title="${missingTitle}">
    <div class="time">${label}</div>
    <div class="icon">${w[1]}</div>
    <strong>${temp(c.averageTemp)}</strong>
    <small>${c.wetPercent}% models wet</small>
    <div class="model-vote">${availabilityText}</div>
    <div class="hour-confidence ${c.cls}"><i class="confidence-dot ${c.cls}"></i>${c.label}</div>
  </div>`;
}

function render() {
  const d = state.data;
  const cur = d.current;
  const [desc, icon] = weatherCodes[cur.weather_code] || ['Weather','🌤️'];
  $('locationName').textContent = state.location;
  $('temperature').textContent = temp(cur.temperature_2m);
  $('condition').textContent = desc;
  $('feelsLike').textContent = `Feels like ${temp(cur.apparent_temperature)}`;
  $('weatherIcon').textContent = icon;
  $('humidity').textContent = `${cur.relative_humidity_2m}%`;
  $('wind').textContent = `${Math.round(cur.wind_speed_10m)} km/h`;
  $('rain').textContent = `${cur.precipitation.toFixed(1)} mm`;
  $('unitBtn').textContent = `°${state.unit}`;
  $('modelCount').textContent = `${state.models.length} / ${MODEL_DEFS.length}`;
  $('updatedAt').textContent = `Updated ${new Date(cur.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;

  const now = new Date();
  let start = d.hourly.time.findIndex(t => new Date(t) >= new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()));
  if (start < 0) start = 0;

  const currentConsensus = consensusAt(d.hourly.time[start]);
  if (currentConsensus) {
    $('confidenceBadge').className = `confidence ${currentConsensus.cls}`;
    $('confidenceBadge').textContent = currentConsensus.label.toUpperCase();
    $('confidenceText').textContent = currentConsensus.available === 6
      ? `All 6 sources analysed · ${currentConsensus.wetCount}/6 predict measurable rain this hour.`
      : `${currentConsensus.available}/6 sources available · ${currentConsensus.wetCount}/${currentConsensus.available} available models predict rain.`;
  }

  $('hourlyForecast').innerHTML = d.hourly.time.slice(start, start + 24).map((t,i) => {
    const dt = new Date(t);
    const label = i === 0 ? 'Now' : dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    return renderHourlyCard(t, label);
  }).join('');

  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
  const tomorrowTimes = d.hourly.time.filter(t => t.startsWith(tomorrowKey));
  $('tomorrowDate').textContent = tomorrow.toLocaleDateString([], {weekday:'long', day:'numeric', month:'short'});
  $('tomorrowHourlyForecast').innerHTML = tomorrowTimes.map(t => {
    const dt = new Date(t);
    return renderHourlyCard(t, dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
  }).join('');

  renderModelComparison(tomorrowKey);
  renderDaily();
  renderSourceIndex();
}

function renderModelComparison(dateKey) {
  const cards = MODEL_DEFS.map(def => {
    const model = state.models.find(m=>m.key===def.key);
    if (!model) return `<div class="model-card unavailable"><b>${def.key}</b><span>Unavailable</span><small>${def.org}</small></div>`;
    const day = aggregateModelDay(model,dateKey);
    if (!day) return `<div class="model-card unavailable"><b>${def.key}</b><span>No data</span><small>${def.org}</small></div>`;
    const [, icon] = weatherCodes[day.code] || ['Weather','🌤️'];
    return `<div class="model-card">
      <b>${def.key}</b>
      <div class="model-icon">${icon}</div>
      <div class="model-temp">${temp(day.high)} <span>${temp(day.low)}</span></div>
      <small>${day.wet ? 'Wet' : 'Dry'} · ${day.rain.toFixed(1)} mm</small>
    </div>`;
  });
  $('modelComparison').innerHTML = cards.join('');
}

function renderDaily() {
  const days = state.data.daily.time.slice(0,7);
  $('dailyForecast').innerHTML = days.map((dateKey,i) => {
    const c = dayConsensus(dateKey);
    const date = new Date(`${dateKey}T12:00:00`);
    const dayName = i===0 ? 'Today' : date.toLocaleDateString([], {weekday:'short'});
    if (!c) return `<div class="day-row consensus-row"><div class="day">${dayName}</div><div>—</div><div class="desc">No model consensus</div><div>—</div><div class="temps">—</div></div>`;
    const [description, icon] = weatherCodes[c.code] || ['Weather','🌤️'];
    return `<div class="day-row consensus-row">
      <div class="day">${dayName}</div>
      <div class="day-weather"><span>${icon}</span><small>${description}</small></div>
      <div class="desc">${c.wetPercent}% models wet · ${c.wetCount}/${c.available} sources</div>
      <div class="daily-confidence ${c.cls}"><i class="confidence-dot ${c.cls}"></i>${c.label}</div>
      <div class="temps">${temp(c.high)}<span>${temp(c.low)}</span></div>
    </div>`;
  }).join('');
}

function renderSourceIndex() {
  $('accuracyIndex').innerHTML = MODEL_DEFS.map((def,idx) => {
    const live = state.models.some(m=>m.key===def.key);
    return `<div class="accuracy-row">
      <div class="rank">${idx+1}</div>
      <div><strong>${def.org}</strong><small>${def.model}</small></div>
      <div class="source-status ${live?'live':'offline'}">${live?'● Live':'● Unavailable'}</div>
      <div class="accuracy-placeholder">Recent local accuracy: <strong>tracking</strong></div>
    </div>`;
  }).join('');
  $('accuracyNote').textContent = 'All hourly consensus votes above use the six named model sources directly. If a source has no value for a particular hour, the card explicitly says how many models were available instead of showing a misleading 4/4 or 5/5 total.';
}

$('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = $('searchInput').value.trim();
  if (!q) return;
  try {
    const results = await geocode(q);
    if (!results.length) return setStatus('error','No matching locations found.');
    $('searchResults').innerHTML = results.map((r,i) => `<button class="result-item" data-i="${i}"><strong>${r.name}</strong><br><span class="muted">${[r.admin1,r.country].filter(Boolean).join(', ')}</span></button>`).join('');
    $('searchResults').classList.remove('hidden');
    [...$('searchResults').querySelectorAll('.result-item')].forEach(btn => btn.addEventListener('click', () => {
      const r = results[Number(btn.dataset.i)];
      state.latitude = r.latitude; state.longitude = r.longitude;
      state.location = [r.name,r.admin1,r.country].filter(Boolean).join(', ');
      $('searchInput').value = r.name;
      $('searchResults').classList.add('hidden');
      fetchWeather(r.latitude,r.longitude);
    }));
  } catch(e) { setStatus('error', e.message); }
});

$('locationBtn').addEventListener('click', () => {
  if (!navigator.geolocation) return setStatus('error','Geolocation is not supported by this browser.');
  setStatus('loading');
  navigator.geolocation.getCurrentPosition(async pos => {
    state.latitude = pos.coords.latitude; state.longitude = pos.coords.longitude;
    state.location = await reverseGeocode(state.latitude,state.longitude);
    fetchWeather(state.latitude,state.longitude);
  }, () => setStatus('error','Location access was denied. Search for a town or city instead.'), {enableHighAccuracy:true,timeout:10000});
});

$('unitBtn').addEventListener('click', () => {
  state.unit = state.unit === 'C' ? 'F' : 'C';
  if (state.data) render();
});

document.addEventListener('click', e => {
  if (!e.target.closest('.search-panel')) $('searchResults').classList.add('hidden');
});

fetchWeather(state.latitude, state.longitude);
