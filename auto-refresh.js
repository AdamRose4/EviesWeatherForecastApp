// Refresh weather/model data every 60 seconds without reloading the whole page.
// Keeps the selected location and temperature unit intact.

const AUTO_REFRESH_MS = 60 * 1000;

async function refreshWeatherSilently() {
  try {
    await fetchWeather(state.latitude, state.longitude);
  } catch (err) {
    console.warn('Auto refresh failed:', err);
  }
}

setInterval(refreshWeatherSilently, AUTO_REFRESH_MS);
