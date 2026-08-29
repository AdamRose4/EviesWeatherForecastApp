// Predictive location search + lightweight browser favourites.
(function () {
  const FAV_KEY = 'eviesWeatherFavouritesV2';
  const input = document.getElementById('searchInput');
  const resultsBox = document.getElementById('searchResults');
  const locationBtn = document.getElementById('locationBtn');
  const searchPanel = document.querySelector('.search-panel');

  if (!input || !resultsBox || !locationBtn || !searchPanel) return;

  // Build the inline link row under the search box.
  const links = document.createElement('div');
  links.className = 'location-links';
  locationBtn.parentNode.insertBefore(links, locationBtn);
  links.appendChild(locationBtn);

  const addFav = document.createElement('button');
  addFav.type = 'button';
  addFav.className = 'favourite-action';
  addFav.textContent = '+ Add favourite';
  links.appendChild(addFav);

  const favList = document.createElement('div');
  favList.className = 'favourites-list-inline';
  links.appendChild(favList);

  resultsBox.classList.add('predictive-results');

  function getState() {
    try { return typeof state !== 'undefined' ? state : null; }
    catch (_) { return null; }
  }

  function readFavourites() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }

  function writeFavourites(items) {
    localStorage.setItem(FAV_KEY, JSON.stringify(items));
  }

  function renderFavourites() {
    const items = readFavourites();
    favList.innerHTML = items.map((fav, i) => `
      <button type="button" class="favourite-location" data-fav-index="${i}" title="Load ${fav.name}">
        <span>★ ${fav.name}</span><span class="remove-favourite" data-remove-index="${i}" title="Remove favourite">×</span>
      </button>`).join('');
  }

  function addCurrentFavourite() {
    const s = getState();
    if (!s || !Number.isFinite(Number(s.latitude)) || !Number.isFinite(Number(s.longitude))) return;

    const items = readFavourites();
    const exists = items.some(f => Math.abs(Number(f.lat) - Number(s.latitude)) < .0001 && Math.abs(Number(f.lon) - Number(s.longitude)) < .0001);
    if (!exists) {
      items.push({ name: s.location || 'Location', lat: Number(s.latitude), lon: Number(s.longitude) });
      writeFavourites(items);
      renderFavourites();
    }
  }

  function loadFavourite(i) {
    const fav = readFavourites()[i];
    const s = getState();
    if (!fav || !s || typeof fetchWeather !== 'function') return;
    s.latitude = Number(fav.lat);
    s.longitude = Number(fav.lon);
    s.location = fav.name;
    input.value = fav.name;
    resultsBox.classList.add('hidden');
    fetchWeather(s.latitude, s.longitude);
  }

  function removeFavourite(i) {
    const items = readFavourites();
    items.splice(i, 1);
    writeFavourites(items);
    renderFavourites();
  }

  addFav.addEventListener('click', addCurrentFavourite);
  favList.addEventListener('click', (e) => {
    const remove = e.target.closest('[data-remove-index]');
    if (remove) {
      e.stopPropagation();
      removeFavourite(Number(remove.dataset.removeIndex));
      return;
    }
    const fav = e.target.closest('[data-fav-index]');
    if (fav) loadFavourite(Number(fav.dataset.favIndex));
  });

  let debounce = null;
  let requestId = 0;

  function resultLabel(r) {
    return [r.admin1, r.country].filter(Boolean).join(', ');
  }

  function showPredictiveResults(results) {
    if (!results.length) {
      resultsBox.classList.add('hidden');
      resultsBox.innerHTML = '';
      return;
    }

    resultsBox.innerHTML = results.slice(0, 6).map((r, i) => `
      <button type="button" class="result-item predictive-item" data-predict-index="${i}">
        <strong>${r.name}</strong><br><span class="muted">${resultLabel(r)}</span>
      </button>`).join('');
    resultsBox.classList.remove('hidden');

    resultsBox.querySelectorAll('[data-predict-index]').forEach(btn => {
      btn.addEventListener('click', () => selectPredictiveResult(results[Number(btn.dataset.predictIndex)]));
    });
  }

  function selectPredictiveResult(r) {
    const s = getState();
    if (!s || !r || typeof fetchWeather !== 'function') return;
    s.latitude = r.latitude;
    s.longitude = r.longitude;
    s.location = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
    input.value = r.name;
    resultsBox.classList.add('hidden');
    fetchWeather(r.latitude, r.longitude);
  }

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim();
    if (q.length < 2) {
      resultsBox.classList.add('hidden');
      resultsBox.innerHTML = '';
      return;
    }

    const myRequest = ++requestId;
    debounce = setTimeout(async () => {
      try {
        if (typeof geocode !== 'function') return;
        const results = await geocode(q);
        if (myRequest !== requestId || input.value.trim() !== q) return;
        showPredictiveResults(results);
      } catch (_) {
        // Keep normal Search button behaviour as a fallback.
      }
    }, 250);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') resultsBox.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-panel')) resultsBox.classList.add('hidden');
  });

  renderFavourites();
})();
