// Rosie: weather-reactive golden cocker spaniel animation for the hero card.
(function () {
  const rainyWords = ['rain','drizzle','shower','storm','thunder','sleet','snow'];

  function moodFromCondition() {
    const text = (document.getElementById('condition')?.textContent || '').toLowerCase();
    return rainyWords.some(word => text.includes(word)) ? 'sad' : 'happy';
  }

  function rosieSvg(mood) {
    const sad = mood === 'sad';
    return `
      <svg viewBox="0 0 110 78" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g class="rosie-dog">
          <path class="rosie-tail" d="M24 41 Q10 ${sad ? 45 : 31} 13 ${sad ? 55 : 22}" fill="none" stroke="#b87834" stroke-width="7" stroke-linecap="round"/>
          <ellipse cx="49" cy="43" rx="28" ry="18" fill="#d69a4b"/>
          <ellipse cx="50" cy="47" rx="19" ry="10" fill="#e8b76e"/>
          <ellipse cx="62" cy="48" rx="9" ry="8" fill="#f2d7aa"/>
          <circle cx="76" cy="30" r="16" fill="#d69a4b"/>
          <ellipse cx="68" cy="31" rx="7" ry="14" fill="#b87834" transform="rotate(15 68 31)"/>
          <ellipse cx="81" cy="18" rx="7" ry="14" fill="#b87834" transform="rotate(-13 81 18)"/>
          <ellipse cx="90" cy="34" rx="6" ry="4.5" fill="#5b3a20"/>
          <circle cx="73" cy="27" r="1.8" fill="#2d241d"/>
          <circle cx="80" cy="27" r="1.8" fill="#2d241d"/>
          <circle cx="88" cy="31" r="2" fill="#2d241d"/>
          <path d="M74 ${sad ? 37 : 34} Q80 ${sad ? 33 : 40} 86 ${sad ? 37 : 34}" fill="none" stroke="#5b3a20" stroke-width="2" stroke-linecap="round"/>
          <rect class="rosie-leg rosie-leg-a" x="33" y="55" width="6" height="17" rx="3" fill="#b87834"/>
          <rect class="rosie-leg rosie-leg-b" x="45" y="55" width="6" height="17" rx="3" fill="#b87834"/>
          <rect class="rosie-leg rosie-leg-a" x="60" y="55" width="6" height="17" rx="3" fill="#b87834"/>
          <rect class="rosie-leg rosie-leg-b" x="72" y="55" width="6" height="17" rx="3" fill="#b87834"/>
        </g>
      </svg>`;
  }

  function updateRosie() {
    const rosie = document.getElementById('rosie');
    if (!rosie) return;
    const mood = moodFromCondition();
    if (rosie.dataset.mood === mood) return;
    rosie.dataset.mood = mood;
    rosie.className = `rosie ${mood}`;
    rosie.innerHTML = rosieSvg(mood);
  }

  updateRosie();
  setInterval(updateRosie, 700);
})();
