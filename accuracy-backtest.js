// 14-day local model accuracy back-test for Evie's Weather Forecasting App.
// Uses Open-Meteo Previous Runs API at a fixed 24-hour lead and compares it
// with Open-Meteo's Historical Forecast series for the selected location.

const ACCURACY_DAYS = 14;
const ACCURACY_LEAD = 1; // previous_day1 = forecast issued 24 hours before valid time
const accuracyCache = new Map();
let accuracyRequestId = 0;

function shiftDateKey(dateKey, deltaDays) {
  const [y,m,d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0,10);
}

function accuracyWindow() {
  const todayKey = state.data?.daily?.time?.[0];
  if (!todayKey) return null;
  const end = shiftDateKey(todayKey, -1);
  const start = shiftDateKey(end, -(ACCURACY_DAYS - 1));
  return { start, end };
}

async function fetchJsonOrThrow(url, label) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label} returned ${res.status}`);
  const json = await res.json();
  if (json?.error) throw new Error(json.reason || `${label} unavailable`);
  return json;
}

async function fetchVerificationWeather(lat, lon, start, end) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    start_date: start,
    end_date: end,
    timezone: 'auto',
    hourly: 'temperature_2m,precipitation'
  });
  return fetchJsonOrThrow(
    `https://historical-forecast-api.open-meteo.com/v1/forecast?${params}`,
    'Historical verification data'
  );
}

async function fetchPreviousRun(def, lat, lon, start, end) {
  const tempField = `temperature_2m_previous_day${ACCURACY_LEAD}`;
  const precipField = `precipitation_previous_day${ACCURACY_LEAD}`;
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    start_date: start,
    end_date: end,
    timezone: 'auto',
    models: def.api,
    hourly: `${tempField},${precipField}`
  });
  const data = await fetchJsonOrThrow(
    `https://previous-runs-api.open-meteo.com/v1/forecast?${params}`,
    `${def.key} archive`
  );
  return { def, data, tempField, precipField };
}

function dailyPrecipTotals(times, values) {
  const totals = new Map();
  times.forEach((time, i) => {
    const value = values?.[i];
    if (!Number.isFinite(value)) return;
    const day = time.slice(0,10);
    totals.set(day, (totals.get(day) || 0) + value);
  });
  return totals;
}

function scoreModel(run, truth) {
  const forecastTimes = run.data.hourly?.time || [];
  const forecastTemps = run.data.hourly?.[run.tempField] || [];
  const forecastPrecip = run.data.hourly?.[run.precipField] || [];
  const truthTimes = truth.hourly?.time || [];
  const truthTemps = truth.hourly?.temperature_2m || [];
  const truthPrecip = truth.hourly?.precipitation || [];

  const truthTempByTime = new Map();
  truthTimes.forEach((t,i) => {
    if (Number.isFinite(truthTemps[i])) truthTempByTime.set(t, truthTemps[i]);
  });

  let absErrorTotal = 0;
  let tempSamples = 0;
  forecastTimes.forEach((t,i) => {
    const f = forecastTemps[i];
    const a = truthTempByTime.get(t);
    if (!Number.isFinite(f) || !Number.isFinite(a)) return;
    absErrorTotal += Math.abs(f - a);
    tempSamples++;
  });

  const mae = tempSamples ? absErrorTotal / tempSamples : null;
  const forecastDaily = dailyPrecipTotals(forecastTimes, forecastPrecip);
  const truthDaily = dailyPrecipTotals(truthTimes, truthPrecip);
  const sharedDays = [...truthDaily.keys()].filter(day => forecastDaily.has(day));

  let rainHits = 0;
  sharedDays.forEach(day => {
    const forecastRain = (forecastDaily.get(day) || 0) >= 0.2;
    const actualRain = (truthDaily.get(day) || 0) >= 0.2;
    if (forecastRain === actualRain) rainHits++;
  });

  const rainAccuracy = sharedDays.length ? (rainHits / sharedDays.length) * 100 : null;
  if (!Number.isFinite(mae) || !Number.isFinite(rainAccuracy)) {
    throw new Error('Insufficient archived samples');
  }

  // Temperature component: 0°C MAE = 100; 2°C MAE = 75; 4°C MAE = 50.
  // Combined score keeps the previously agreed 70% temperature / 30% rain weighting.
  const tempScore = clamp(100 - (mae * 12.5), 0, 100);
  const score = Math.round((tempScore * 0.70) + (rainAccuracy * 0.30));

  return {
    key: run.def.key,
    def: run.def,
    score,
    mae,
    rainAccuracy: Math.round(rainAccuracy),
    days: sharedDays.length,
    tempSamples
  };
}

function accuracyLoadingRows() {
  $('accuracyWindow').textContent = `${ACCURACY_DAYS}-day local back-test`;
  $('accuracyIndex').innerHTML = MODEL_DEFS.map((def,idx) => {
    const live = state.models.some(m => m.key === def.key);
    return `<div class="accuracy-row">
      <div class="rank">${idx + 1}</div>
      <div><strong>${def.org}</strong><small>${def.model}</small></div>
      <div class="source-status ${live ? 'live' : 'offline'}">${live ? '● Live' : '● Unavailable'}</div>
      <div class="accuracy-placeholder">Calculating 14-day accuracy…</div>
    </div>`;
  }).join('');
  $('accuracyNote').textContent = 'Comparing each model’s 24-hour-ahead archived forecast with the historical verification series for this location.';
}

function renderAccuracyResults(results, start, end) {
  const byKey = new Map(results.map(r => [r.key, r]));
  const ranked = results.filter(r => Number.isFinite(r.score)).sort((a,b) => b.score - a.score);
  const rankByKey = new Map(ranked.map((r,i) => [r.key, i + 1]));

  $('accuracyWindow').textContent = `${ACCURACY_DAYS}-day local accuracy · 24h lead`;
  $('accuracyIndex').innerHTML = MODEL_DEFS.map(def => {
    const live = state.models.some(m => m.key === def.key);
    const r = byKey.get(def.key);
    const rank = rankByKey.get(def.key) || '—';
    if (!r || r.error) {
      return `<div class="accuracy-row">
        <div class="rank">${rank}</div>
        <div><strong>${def.org}</strong><small>${def.model}</small></div>
        <div class="source-status ${live ? 'live' : 'offline'}">${live ? '● Live' : '● Unavailable'}</div>
        <div class="accuracy-placeholder"><strong>Archive unavailable</strong><small>Not scored for this window</small></div>
      </div>`;
    }
    return `<div class="accuracy-row">
      <div class="rank">${rank}</div>
      <div><strong>${def.org}</strong><small>${def.model}</small></div>
      <div class="source-status ${live ? 'live' : 'offline'}">${live ? '● Live' : '● Unavailable'}</div>
      <div class="accuracy-placeholder"><strong>${r.score}%</strong><small>${r.mae.toFixed(1)}°C temp MAE · ${r.rainAccuracy}% rain/dry · ${r.days} days</small></div>
    </div>`;
  }).join('');

  $('accuracyNote').textContent = `Local back-test ${start} to ${end}. Score = 70% temperature skill + 30% correct rain/dry days. Temperature skill is derived from hourly mean absolute error. Verification uses Open-Meteo Historical Forecast data rather than a single nearby weather station, so treat this as a comparative model score rather than an official provider accuracy claim.`;
}

async function calculateLocalAccuracy() {
  const window = accuracyWindow();
  if (!window) return;
  const lat = Number(state.latitude).toFixed(4);
  const lon = Number(state.longitude).toFixed(4);
  const cacheKey = `${lat},${lon},${window.start},${window.end}`;
  const requestId = ++accuracyRequestId;

  accuracyLoadingRows();
  if (accuracyCache.has(cacheKey)) {
    const cached = accuracyCache.get(cacheKey);
    renderAccuracyResults(cached, window.start, window.end);
    return;
  }

  try {
    const truth = await fetchVerificationWeather(state.latitude, state.longitude, window.start, window.end);
    const settled = await Promise.allSettled(
      MODEL_DEFS.map(def => fetchPreviousRun(def, state.latitude, state.longitude, window.start, window.end))
    );
    if (requestId !== accuracyRequestId) return;

    const results = settled.map((item, i) => {
      const def = MODEL_DEFS[i];
      if (item.status !== 'fulfilled') return { key: def.key, def, error: true };
      try { return scoreModel(item.value, truth); }
      catch { return { key: def.key, def, error: true }; }
    });

    accuracyCache.set(cacheKey, results);
    renderAccuracyResults(results, window.start, window.end);
  } catch (e) {
    if (requestId !== accuracyRequestId) return;
    $('accuracyWindow').textContent = `${ACCURACY_DAYS}-day local back-test`;
    $('accuracyNote').textContent = `Accuracy archive could not be loaded right now: ${e.message}. Live forecasts above are unaffected.`;
  }
}

// Replace the placeholder source-index renderer used by app.js.
renderSourceIndex = function() {
  calculateLocalAccuracy();
};

// If the initial forecast resolved before this override loaded, start the back-test now.
if (state.data) calculateLocalAccuracy();
