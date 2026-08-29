// Rosie v4: properly directional, weather-reactive golden cocker spaniel.
// Direction is calculated from the destination. Rosie turns first, then walks.
(function () {
  const rainyWords = ['rain','drizzle','shower','storm','thunder','sleet','snow'];
  let stepTimer = null;
  let moveTimer = null;
  let stepIndex = 0;
  let currentX = 10;
  let facing = 'right';

  const patrol = [
    { pose:'walk', x:58, ms:3100 },
    { pose:'stand', x:58, ms:750 },
    { pose:'sit', x:58, ms:2600 },
    { pose:'stand', x:58, ms:700 },
    { pose:'walk', x:10, ms:3100 },
    { pose:'stand', x:10, ms:750 },
    { pose:'sit', x:10, ms:2400 },
    { pose:'stand', x:10, ms:700 }
  ];

  function moodFromWeather() {
    const condition = (document.getElementById('condition')?.textContent || '').toLowerCase();
    const vote = document.querySelector('#hourlyForecast .model-vote')?.textContent || '';
    const m = vote.match(/(\d+)\/(\d+)/);
    const consensusWet = m ? Number(m[1]) >= 3 : false;
    return rainyWords.some(w => condition.includes(w)) || consensusWet ? 'sad' : 'happy';
  }

  function rosieSvg() {
    return `
      <svg viewBox="0 0 170 112" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="rosieCoat4" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#f3c27a"/>
            <stop offset=".55" stop-color="#d99243"/>
            <stop offset="1" stop-color="#b96f2b"/>
          </linearGradient>
          <linearGradient id="rosieEar4" x1="0" x2="1">
            <stop offset="0" stop-color="#b66b29"/>
            <stop offset="1" stop-color="#87491d"/>
          </linearGradient>
        </defs>

        <g class="rosie-direction">
          <g class="rosie-dog">
            <ellipse class="rosie-shadow" cx="82" cy="100" rx="53" ry="5" fill="rgba(0,0,0,.18)"/>

            <g class="rosie-tail-group">
              <path class="rosie-tail" d="M38 65 C18 64 9 51 18 37 C23 29 33 29 35 37 C27 43 28 52 42 57" fill="none" stroke="url(#rosieCoat4)" stroke-width="10" stroke-linecap="round"/>
              <path d="M20 38 C16 33 17 27 22 23" fill="none" stroke="#efb76b" stroke-width="3" stroke-linecap="round" opacity=".75"/>
            </g>

            <g class="rosie-body-group">
              <ellipse class="rosie-body" cx="73" cy="67" rx="41" ry="23" fill="url(#rosieCoat4)"/>
              <path d="M42 60 C53 45 81 43 98 54" fill="none" stroke="#f5ca86" stroke-width="3" stroke-linecap="round" opacity=".55"/>
              <ellipse class="rosie-chest" cx="96" cy="70" rx="15" ry="19" fill="#f0d0a3"/>
              <path d="M87 60 C94 66 99 72 101 83" fill="none" stroke="#fff0d2" stroke-width="3" opacity=".55"/>
              <path d="M52 80 Q59 87 65 80 Q72 87 78 80 Q85 86 91 79" fill="none" stroke="#e4aa5e" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
            </g>

            <g class="rosie-hind-leg-group">
              <path class="rosie-hind-leg" d="M49 79 C46 86 46 93 48 100 L59 100 C59 91 61 84 66 77" fill="#b86f2c"/>
              <ellipse class="rosie-paw" cx="53" cy="100" rx="8" ry="3.5" fill="#915020"/>
            </g>
            <g class="rosie-front-legs">
              <path class="rosie-leg rosie-leg-a" d="M90 79 L90 100 L100 100 L101 76" fill="#c47b31"/>
              <ellipse class="rosie-paw" cx="95" cy="100" rx="8" ry="3.5" fill="#955221"/>
              <path class="rosie-leg rosie-leg-b" d="M106 76 L107 100 L117 100 L116 73" fill="#b86f2c"/>
              <ellipse class="rosie-paw" cx="112" cy="100" rx="8" ry="3.5" fill="#8d4c1f"/>
            </g>

            <!-- FAR EAR: lower-set and always behind the head -->
            <path class="rosie-ear rosie-ear-back" d="M108 30 C94 30 87 41 89 59 C91 77 99 88 108 81 C114 72 114 45 108 30Z" fill="url(#rosieEar4)"/>
            <path d="M95 42 C95 58 100 70 106 79" fill="none" stroke="#cf8439" stroke-width="2.5" opacity=".7"/>

            <g class="rosie-head-group">
              <ellipse class="rosie-head" cx="121" cy="46" rx="24" ry="23" fill="url(#rosieCoat4)"/>
              <ellipse class="rosie-muzzle" cx="140" cy="55" rx="16" ry="11" fill="#e8bb7f"/>
              <path d="M111 31 C120 26 130 28 136 34" fill="none" stroke="#f4c883" stroke-width="3" stroke-linecap="round" opacity=".5"/>

              <g class="rosie-face">
                <ellipse cx="116" cy="45" rx="2.6" ry="3.2" fill="#2c211b"/>
                <ellipse cx="126" cy="45" rx="2.6" ry="3.2" fill="#2c211b"/>
                <circle cx="115.3" cy="44" r=".8" fill="#fff" opacity=".85"/>
                <circle cx="125.3" cy="44" r=".8" fill="#fff" opacity=".85"/>
                <path class="rosie-brow-left" d="M111 39 Q116 36 120 39" fill="none" stroke="#7e4922" stroke-width="1.7" stroke-linecap="round"/>
                <path class="rosie-brow-right" d="M122 39 Q127 36 131 39" fill="none" stroke="#7e4922" stroke-width="1.7" stroke-linecap="round"/>
                <ellipse class="rosie-nose" cx="149" cy="54" rx="4.5" ry="3.5" fill="#30221b"/>
                <path class="rosie-mouth-happy" d="M137 61 Q143 67 149 61" fill="none" stroke="#563722" stroke-width="2" stroke-linecap="round"/>
                <path class="rosie-mouth-sad" d="M137 65 Q143 59 149 65" fill="none" stroke="#563722" stroke-width="2" stroke-linecap="round"/>
                <path class="rosie-tongue" d="M141 64 Q145 72 149 64" fill="#d97978"/>
              </g>
              <path class="rosie-collar" d="M102 64 Q118 73 133 66" fill="none" stroke="#4ba6c8" stroke-width="3.5" stroke-linecap="round"/>
              <circle cx="117" cy="72" r="3.2" fill="#f3cb4f"/>
            </g>

            <!-- NEAR EAR: lower-set and always in front of the head -->
            <path class="rosie-ear rosie-ear-front" d="M127 29 C140 29 147 41 144 61 C141 80 132 91 123 83 C117 74 120 43 127 29Z" fill="#a95f25"/>
            <path d="M137 41 C140 57 135 72 128 81" fill="none" stroke="#cf8238" stroke-width="2.5" opacity=".72"/>
          </g>
        </g>
      </svg>`;
  }

  function applyMood(rosie) {
    const mood = moodFromWeather();
    rosie.classList.toggle('happy', mood === 'happy');
    rosie.classList.toggle('sad', mood === 'sad');
  }

  function setFacing(rosie, dir) {
    facing = dir || facing;
    rosie.classList.toggle('face-left', facing === 'left');
    rosie.classList.toggle('face-right', facing === 'right');
  }

  function setPoseClass(rosie, pose) {
    rosie.classList.remove('walking','sitting','standing');
    rosie.classList.add(pose === 'walk' ? 'walking' : pose === 'sit' ? 'sitting' : 'standing');
  }

  function runStep() {
    const rosie = document.getElementById('rosie');
    if (!rosie) return;
    const step = patrol[stepIndex % patrol.length];
    clearTimeout(moveTimer);
    clearTimeout(stepTimer);

    if (step.pose === 'walk') {
      const dir = step.x > currentX ? 'right' : step.x < currentX ? 'left' : facing;
      setPoseClass(rosie, 'stand');
      setFacing(rosie, dir);
      rosie.style.setProperty('--rosie-move-ms', `${Math.max(600, step.ms - 220)}ms`);
      moveTimer = setTimeout(() => {
        setPoseClass(rosie, 'walk');
        rosie.style.left = `${step.x}%`;
        currentX = step.x;
      }, 220);
    } else {
      setPoseClass(rosie, step.pose);
      rosie.style.left = `${step.x}%`;
      currentX = step.x;
    }

    stepIndex += 1;
    stepTimer = setTimeout(runStep, step.ms);
  }

  function initialiseRosie() {
    const rosie = document.getElementById('rosie');
    if (!rosie) return;
    if (!rosie.dataset.ready) {
      rosie.innerHTML = rosieSvg();
      rosie.dataset.ready = '1';
      rosie.style.left = `${currentX}%`;
      setFacing(rosie, 'right');
      setPoseClass(rosie, 'standing');
    }
    applyMood(rosie);
    if (!stepTimer) runStep();
  }

  initialiseRosie();
  setInterval(initialiseRosie, 800);
})();
