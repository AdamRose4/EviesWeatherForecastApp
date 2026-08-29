// Rosie: weather-reactive golden cocker spaniel companion for the hero card.
// She patrols a safe middle area, pauses, sits, looks around, then walks back.
(function () {
  const rainyWords = ['rain','drizzle','shower','storm','thunder','sleet','snow'];
  let stepTimer = null;
  let stepIndex = 0;

  const patrol = [
    { pose:'walk', side:'left',  x: 4,  ms: 600 },
    { pose:'walk', side:'right', x: 66, ms: 3400 },
    { pose:'stand', side:'right', x: 66, ms: 700 },
    { pose:'sit', side:'right', x: 66, ms: 2700 },
    { pose:'stand', side:'right', x: 66, ms: 650 },
    { pose:'walk', side:'left', x: 8,  ms: 3400 },
    { pose:'stand', side:'left', x: 8,  ms: 650 },
    { pose:'sit', side:'left', x: 8,  ms: 2400 },
    { pose:'stand', side:'left', x: 8,  ms: 650 }
  ];

  function moodFromCondition() {
    const text = (document.getElementById('condition')?.textContent || '').toLowerCase();
    return rainyWords.some(word => text.includes(word)) ? 'sad' : 'happy';
  }

  function rosieSvg() {
    return `
      <svg viewBox="0 0 132 94" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="rosieCoat" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#efbd72"/>
            <stop offset=".55" stop-color="#d89a4d"/>
            <stop offset="1" stop-color="#bd7932"/>
          </linearGradient>
          <linearGradient id="rosieEar" x1="0" x2="1">
            <stop offset="0" stop-color="#b8702c"/>
            <stop offset="1" stop-color="#8f5425"/>
          </linearGradient>
        </defs>

        <g class="rosie-dog">
          <ellipse class="rosie-shadow" cx="63" cy="83" rx="40" ry="5" fill="rgba(0,0,0,.18)"/>

          <g class="rosie-tail-group">
            <path class="rosie-tail" d="M29 51 C15 49 8 39 16 29 C19 25 24 26 25 31 C19 36 20 42 31 44" fill="none" stroke="url(#rosieCoat)" stroke-width="9" stroke-linecap="round"/>
            <path d="M18 31 C13 26 14 22 18 19" fill="none" stroke="#e8ad62" stroke-width="3" stroke-linecap="round" opacity=".65"/>
          </g>

          <g class="rosie-body-group">
            <ellipse class="rosie-body" cx="59" cy="53" rx="34" ry="22" fill="url(#rosieCoat)"/>
            <path d="M34 47 C42 35 68 32 82 44" fill="none" stroke="#f2c681" stroke-width="3" stroke-linecap="round" opacity=".55"/>
            <ellipse class="rosie-chest" cx="77" cy="58" rx="13" ry="16" fill="#f0d2a6" opacity=".95"/>
            <path d="M68 48 C73 53 77 57 80 67" fill="none" stroke="#fff0d1" stroke-width="3" stroke-linecap="round" opacity=".55"/>
          </g>

          <g class="rosie-hind-leg-group">
            <path class="rosie-hind-leg" d="M38 65 C36 72 35 78 37 84 L46 84 C46 76 47 69 51 64" fill="#bd7932"/>
            <ellipse class="rosie-paw" cx="41" cy="84" rx="7" ry="3.5" fill="#9b5d2a"/>
          </g>

          <g class="rosie-front-legs">
            <path class="rosie-leg rosie-leg-a" d="M72 66 L72 84 L81 84 L82 64" fill="#c98136"/>
            <ellipse class="rosie-paw" cx="76.5" cy="84" rx="7" ry="3.5" fill="#9b5d2a"/>
            <path class="rosie-leg rosie-leg-b" d="M86 63 L87 84 L96 84 L95 61" fill="#bd7932"/>
            <ellipse class="rosie-paw" cx="91.5" cy="84" rx="7" ry="3.5" fill="#915426"/>
          </g>

          <g class="rosie-head-group">
            <circle class="rosie-head" cx="91" cy="36" r="21" fill="url(#rosieCoat)"/>
            <ellipse class="rosie-muzzle" cx="105" cy="43" rx="14" ry="10" fill="#e7bc82"/>

            <path class="rosie-ear rosie-ear-back" d="M81 20 C70 19 64 26 66 41 C68 55 75 62 81 56 C85 50 84 31 81 20Z" fill="url(#rosieEar)"/>
            <path class="rosie-ear rosie-ear-front" d="M97 18 C105 16 111 24 109 38 C107 52 101 58 96 53 C92 47 93 27 97 18Z" fill="#a96228"/>
            <path d="M70 30 C70 43 73 50 78 55" fill="none" stroke="#d18a3f" stroke-width="2.5" opacity=".75"/>
            <path d="M104 27 C106 37 104 46 100 52" fill="none" stroke="#ca7c35" stroke-width="2.5" opacity=".7"/>

            <g class="rosie-face">
              <ellipse class="rosie-eye rosie-eye-left" cx="87" cy="34" rx="2.4" ry="3" fill="#2c211b"/>
              <ellipse class="rosie-eye rosie-eye-right" cx="96" cy="34" rx="2.4" ry="3" fill="#2c211b"/>
              <circle cx="86.3" cy="33" r=".8" fill="#fff" opacity=".8"/>
              <circle cx="95.3" cy="33" r=".8" fill="#fff" opacity=".8"/>
              <path class="rosie-brow rosie-brow-left" d="M83 29 Q87 27 90 29" fill="none" stroke="#805026" stroke-width="1.5" stroke-linecap="round"/>
              <path class="rosie-brow rosie-brow-right" d="M93 29 Q97 27 100 29" fill="none" stroke="#805026" stroke-width="1.5" stroke-linecap="round"/>
              <ellipse class="rosie-nose" cx="112" cy="42" rx="4" ry="3.2" fill="#33251e"/>
              <path class="rosie-mouth-happy" d="M103 47 Q108 52 113 47" fill="none" stroke="#573a27" stroke-width="2" stroke-linecap="round"/>
              <path class="rosie-mouth-sad" d="M103 50 Q108 45 113 50" fill="none" stroke="#573a27" stroke-width="2" stroke-linecap="round"/>
              <path class="rosie-tongue" d="M107 50 Q110 57 113 50" fill="#d77a78" opacity=".95"/>
            </g>

            <path class="rosie-collar" d="M76 51 Q88 59 99 54" fill="none" stroke="#4ba6c8" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="88" cy="57" r="3" fill="#f4cd50"/>
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
