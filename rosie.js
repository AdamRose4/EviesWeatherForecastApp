// Rosie v3: detailed weather-reactive golden cocker spaniel companion.
// Back ear is drawn behind the head; front ear is drawn in front. Flipping the
// whole direction group swaps the visible side correctly when Rosie turns.
(function () {
  const rainyWords = ['rain','drizzle','shower','storm','thunder','sleet','snow'];
  let stepTimer = null;
  let stepIndex = 0;

  const patrol = [
    { pose:'walk', side:'right', x: 8,  ms: 500 },
    { pose:'walk', side:'right', x: 58, ms: 2900 },
    { pose:'stand',side:'right', x: 58, ms: 700 },
    { pose:'sit',  side:'right', x: 58, ms: 2600 },
    { pose:'stand',side:'right', x: 58, ms: 650 },
    { pose:'walk', side:'left',  x: 10, ms: 2900 },
    { pose:'stand',side:'left',  x: 10, ms: 700 },
    { pose:'sit',  side:'left',  x: 10, ms: 2300 },
    { pose:'stand',side:'left',  x: 10, ms: 650 }
  ];

  function moodFromCondition() {
    const text = (document.getElementById('condition')?.textContent || '').toLowerCase();
    return rainyWords.some(word => text.includes(word)) ? 'sad' : 'happy';
  }

  function rosieSvg() {
    return `
      <svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="rosieCoat3" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#f1bf73"/>
            <stop offset=".55" stop-color="#d99343"/>
            <stop offset="1" stop-color="#b86f2c"/>
          </linearGradient>
          <linearGradient id="rosieEar3" x1="0" x2="1">
            <stop offset="0" stop-color="#b56a29"/>
            <stop offset="1" stop-color="#8f4f20"/>
          </linearGradient>
        </defs>

        <g class="rosie-direction">
          <g class="rosie-dog">
            <ellipse class="rosie-shadow" cx="77" cy="92" rx="50" ry="5" fill="rgba(0,0,0,.18)"/>

            <g class="rosie-tail-group">
              <path class="rosie-tail" d="M34 59 C15 57 8 44 17 31 C22 24 31 25 32 33 C25 39 25 47 39 51" fill="none" stroke="url(#rosieCoat3)" stroke-width="10" stroke-linecap="round"/>
              <path d="M20 32 C15 27 16 22 21 18" fill="none" stroke="#efb76b" stroke-width="3" stroke-linecap="round" opacity=".7"/>
              <path d="M24 34 C19 31 19 27 22 24" fill="none" stroke="#f3ca8a" stroke-width="2" stroke-linecap="round" opacity=".7"/>
            </g>

            <!-- FAR EAR: intentionally before the head so it stays behind it -->
            <path class="rosie-ear rosie-ear-back" d="M101 27 C88 22 80 31 81 48 C82 64 89 75 98 70 C105 64 106 39 101 27Z" fill="url(#rosieEar3)"/>
            <path d="M87 39 C87 53 91 62 97 69" fill="none" stroke="#cd8337" stroke-width="2.5" opacity=".75"/>

            <g class="rosie-body-group">
              <ellipse class="rosie-body" cx="69" cy="61" rx="39" ry="22" fill="url(#rosieCoat3)"/>
              <path d="M39 55 C50 40 78 38 93 50" fill="none" stroke="#f5ca86" stroke-width="3" stroke-linecap="round" opacity=".55"/>
              <path d="M39 66 C47 75 58 79 70 78" fill="none" stroke="#c57930" stroke-width="2.5" opacity=".45"/>
              <ellipse class="rosie-chest" cx="91" cy="65" rx="14" ry="18" fill="#f0d0a3"/>
              <path d="M82 55 C89 61 94 67 96 78" fill="none" stroke="#fff0d2" stroke-width="3" opacity=".55"/>
              <path d="M51 75 Q58 82 63 76 Q69 83 74 76 Q80 82 85 75" fill="none" stroke="#e5ad62" stroke-width="2.3" stroke-linecap="round" opacity=".7"/>
            </g>

            <g class="rosie-hind-leg-group">
              <path class="rosie-hind-leg" d="M46 73 C43 80 43 87 45 92 L56 92 C56 83 58 76 62 70" fill="#b86f2c"/>
              <path d="M44 79 Q49 83 55 79" fill="none" stroke="#e2a65a" stroke-width="2" opacity=".6"/>
              <ellipse class="rosie-paw" cx="50" cy="92" rx="8" ry="3.5" fill="#915020"/>
            </g>

            <g class="rosie-front-legs">
              <path class="rosie-leg rosie-leg-a" d="M85 72 L85 92 L95 92 L96 69" fill="#c47b31"/>
              <ellipse class="rosie-paw" cx="90" cy="92" rx="8" ry="3.5" fill="#955221"/>
              <path class="rosie-leg rosie-leg-b" d="M101 69 L102 92 L112 92 L111 66" fill="#b86f2c"/>
              <ellipse class="rosie-paw" cx="107" cy="92" rx="8" ry="3.5" fill="#8d4c1f"/>
            </g>

            <g class="rosie-head-group">
              <circle class="rosie-head" cx="112" cy="41" r="23" fill="url(#rosieCoat3)"/>
              <ellipse class="rosie-muzzle" cx="129" cy="49" rx="15" ry="10.5" fill="#e8bb7f"/>
              <path d="M104 26 C112 22 121 24 127 30" fill="none" stroke="#f4c883" stroke-width="3" stroke-linecap="round" opacity=".5"/>

              <g class="rosie-face">
                <ellipse class="rosie-eye rosie-eye-left" cx="107" cy="39" rx="2.5" ry="3.2" fill="#2c211b"/>
                <ellipse class="rosie-eye rosie-eye-right" cx="117" cy="39" rx="2.5" ry="3.2" fill="#2c211b"/>
                <circle cx="106.3" cy="38" r=".8" fill="#fff" opacity=".85"/>
                <circle cx="116.3" cy="38" r=".8" fill="#fff" opacity=".85"/>
                <path class="rosie-brow rosie-brow-left" d="M102 34 Q107 31 111 34" fill="none" stroke="#7e4922" stroke-width="1.7" stroke-linecap="round"/>
                <path class="rosie-brow rosie-brow-right" d="M113 34 Q118 31 122 34" fill="none" stroke="#7e4922" stroke-width="1.7" stroke-linecap="round"/>
                <ellipse class="rosie-nose" cx="137" cy="48" rx="4.4" ry="3.5" fill="#30221b"/>
                <path class="rosie-mouth-happy" d="M126 54 Q132 60 138 54" fill="none" stroke="#563722" stroke-width="2" stroke-linecap="round"/>
                <path class="rosie-mouth-sad" d="M126 58 Q132 52 138 58" fill="none" stroke="#563722" stroke-width="2" stroke-linecap="round"/>
                <path class="rosie-tongue" d="M130 57 Q134 65 138 57" fill="#d97978"/>
              </g>

              <path class="rosie-collar" d="M95 58 Q109 67 123 60" fill="none" stroke="#4ba6c8" stroke-width="3.5" stroke-linecap="round"/>
              <circle cx="108" cy="65" r="3.2" fill="#f3cb4f"/>
            </g>

            <!-- NEAR EAR: deliberately after the head so it sits in front -->
            <path class="rosie-ear rosie-ear-front" d="M118 24 C129 21 136 31 134 48 C132 66 124 77 116 70 C110 63 112 37 118 24Z" fill="#a95f25"/>
            <path d="M127 34 C130 48 126 61 120 69" fill="none" stroke="#cf8238" stroke-width="2.5" opacity=".75"/>
          </g>
        </g>
      </svg>`;
  }

  function applyMood(rosie) {
    const mood = moodFromCondition();
    rosie.dataset.mood = mood;
    rosie.classList.toggle('happy', mood === 'happy');
    rosie.classList.toggle('sad', mood === 'sad');
  }

  function setPose(rosie, step) {
    rosie.classList.remove('walking','sitting','standing','face-left','face-right');
    rosie.classList.add(step.pose === 'walk' ? 'walking' : step.pose === 'sit' ? 'sitting' : 'standing');
    rosie.classList.add(step.side === 'left' ? 'face-left' : 'face-right');
    rosie.style.left = `${step.x}%`;
  }

  function runPatrol() {
    const rosie = document.getElementById('rosie');
    if (!rosie) return;
    const step = patrol[stepIndex % patrol.length];
    setPose(rosie, step);
    stepIndex += 1;
    clearTimeout(stepTimer);
    stepTimer = setTimeout(runPatrol, step.ms);
  }

  function initialiseRosie() {
    const rosie = document.getElementById('rosie');
    if (!rosie) return;
    if (!rosie.dataset.ready) {
      rosie.innerHTML = rosieSvg();
      rosie.dataset.ready = '1';
    }
    applyMood(rosie);
    if (!stepTimer) runPatrol();
  }

  initialiseRosie();
  setInterval(initialiseRosie, 800);
})();
