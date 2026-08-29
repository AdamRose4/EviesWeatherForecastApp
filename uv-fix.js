// UV presentation fix for Evie's Weather Forecasting App.
// Uses Open-Meteo clear-sky UV potential for the hourly tiles and removes
// the word "available" from rain vote labels.
(function () {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function(input, init) {
    let url = typeof input === 'string' ? input : input?.url;
    let shouldAdjustUv = false;

    if (url && url.includes('api.open-meteo.com/v1/forecast')) {
      try {
        const u = new URL(url);
        const hourly = u.searchParams.get('hourly') || '';
        const hasModels = u.searchParams.has('models');
        if (!hasModels && hourly.split(',').includes('uv_index')) {
          shouldAdjustUv = true;
          const vars = hourly.split(',').filter(Boolean);
          if (!vars.includes('uv_index_clear_sky')) vars.push('uv_index_clear_sky');
          u.searchParams.set('hourly', vars.join(','));
          url = u.toString();
        }
      } catch (_) {}
    }

    const response = await originalFetch(url || input, init);
    if (!shouldAdjustUv) return response;

    // app.js only relies on .ok and .json() for this request, so a lightweight
    // wrapper lets us substitute the clear-sky UV potential cleanly.
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      json: async () => {
        const data = await response.json();
        if (data?.hourly?.uv_index_clear_sky?.length) {
          data.hourly.uv_index = data.hourly.uv_index_clear_sky.map(v =>
            Number.isFinite(v) ? Math.round(v) : v
          );
        }
        return data;
      }
    };
  };

  function tidyHourlyLabels() {
    document.querySelectorAll('#hourlyForecast .model-vote, #tomorrowHourlyForecast .model-vote').forEach(el => {
      el.textContent = (el.textContent || '').replace(/\s+available\s+rain/i, ' rain');
    });

    document.querySelectorAll('#hourlyForecast .hour-extra, #tomorrowHourlyForecast .hour-extra').forEach(el => {
      const text = el.textContent || '';
      if (!text.includes('UV')) return;
      const m = text.match(/UV\s+(-?\d+(?:\.\d+)?)\s+(Low|Moderate|High|Very high|Extreme)/i);
      if (!m) return;
      const uv = Math.max(0, Math.round(Number(m[1])));
      let label = 'Low';
      if (uv >= 11) label = 'Extreme';
      else if (uv >= 8) label = 'Very high';
      else if (uv >= 6) label = 'High';
      else if (uv >= 3) label = 'Moderate';
      el.textContent = `☀️ UV ${uv} ${label}`;
    });
  }

  tidyHourlyLabels();
  setInterval(tidyHourlyLabels, 700);
})();
