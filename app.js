const CONFIG = {
  API_URL: "https://tinyurl.com/cbtleader",
  REFRESH_INTERVAL: 10, // seconds
};

const lbBody = document.getElementById('lbBody');
const statusText = document.getElementById('statusText');
const timerEl = document.getElementById('timer');
const topTimer = document.getElementById('topTimer');
const emptyMsg = document.getElementById('emptyMsg');
const refreshBtn = document.getElementById('refreshBtn');

/* ── College persistence ── */
const collegeName = document.getElementById('collegeName');
const collegeInput = document.getElementById('collegeInput');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

function loadCollege() {
  const saved = localStorage.getItem('collegeName');
  collegeName.textContent = saved || '';
}

function setEditMode(on) {
  collegeName.classList.toggle('hidden', on);
  collegeInput.classList.toggle('visible', on);
  editBtn.classList.toggle('hidden', on);
  saveBtn.classList.toggle('visible', on);
  cancelBtn.classList.toggle('visible', on);
  if (on) {
    collegeInput.value = localStorage.getItem('collegeName') || '';
    collegeInput.focus();
    editBtn.disabled = true;
  } else {
    editBtn.disabled = false;
  }
}
function saveCollege() {
  const v = collegeInput.value.trim();
  if (v) localStorage.setItem('collegeName', v);
  else localStorage.removeItem('collegeName');
  collegeName.textContent = v;
  setEditMode(false);
}

loadCollege();
editBtn.addEventListener('click', () => setEditMode(true));
saveBtn.addEventListener('click', saveCollege);
cancelBtn.addEventListener('click', () => setEditMode(false));
collegeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveCollege();
  if (e.key === 'Escape') setEditMode(false);
});

let countdownValue = CONFIG.REFRESH_INTERVAL;
let countdownInterval = null;

/* ── Fetch marks from Google Sheets ── */
async function fetchMarks() {
  showStatus('loading', 'Syncing data…');

  try {
    const res = await fetch(CONFIG.API_URL);
    const data = await res.json();

    if (data.error) {
      showStatus('error', data.error);
      return;
    }

    renderData(data);
    window.triggerClimbAnimation(data);
    showStatus('ok', `Updated at ${new Date().toLocaleTimeString()}`);
    startCountdown();
  } catch (err) {
    showStatus('error', 'Failed to load. Check your connection.');
    console.error(err);
  }
}

/* ── Render student cards ── */
function renderData(data) {
  lbBody.innerHTML = '';
  const podium = document.getElementById('podium');
  podium.innerHTML = '';

  if (!data || data.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');
  const topMarks = data[0].marks;

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  /* Top 3 podium */
  const podiumOrder = [1, 0, 2]; // left=rank2, center=rank1, right=rank3
  podiumOrder.forEach((idx) => {
    const i = idx;
    if (i >= top3.length) return;
    const row = top3[i];
    const rank = i + 1;
    const marks = Number(row.marks);
    const box = document.createElement('div');
    box.className = `podium-box podium-rank-${rank}`;
    box.style.animationDelay = (i * 0.1) + 's';

    const trophyEmoji = rank === 1 ? '🏆' : rank === 2 ? '🥈' : '🥉';

    box.innerHTML = `
      <span class="podium-big-num">${String(rank).padStart(2, '0')}</span>
      <span class="podium-trophy podium-trophy-${rank}" aria-hidden="true">${trophyEmoji}</span>
      <h3 class="podium-name">${escapeHTML(row.name)}</h3>
      <div class="podium-score-row">
        <p class="podium-pts">${marks.toLocaleString()} <span>PTS</span></p>
        <span class="material-symbols-outlined podium-stars" style="font-variation-settings: 'FILL' 1;">${rank === 1 ? 'stars' : 'star'}</span>
      </div>
    `;

    podium.appendChild(box);
  });

  /* Ranks 4+ table */
  rest.forEach((row, j) => {
    const rank = j + 4;
    const marks = Number(row.marks);
    const card = document.createElement('div');
    card.className = 'student-card';
    let rankEl = `<span class="rank-plain">${String(rank).padStart(2, '0')}</span>`;

    card.innerHTML = `
      <div class="card-rank">${rankEl}</div>
      <div class="card-name">${escapeHTML(row.name)}</div>
      <div><span class="score-chip">${marks.toLocaleString()}</span></div>
    `;

    card.style.animationDelay = (j * 0.05) + 's';
    lbBody.appendChild(card);
  });
}

/* ── Status ── */
function showStatus(type, msg) {
  statusText.textContent = msg;
  const dot = document.querySelector('.live-dot');
  if (type === 'error') {
    dot.style.background = 'var(--danger)';
  } else {
    dot.style.background = 'var(--success)';
  }
}

/* ── Countdown ── */
function startCountdown() {
  clearInterval(countdownInterval);
  countdownValue = CONFIG.REFRESH_INTERVAL;
  updateTimerDisplay();

  countdownInterval = setInterval(() => {
    countdownValue--;
    if (countdownValue < 0) {
      countdownValue = CONFIG.REFRESH_INTERVAL;
    }
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  timerEl.textContent = `${countdownValue}s`;
  if (topTimer) topTimer.textContent = `${countdownValue}s`;
}

/* ── XSS safety ── */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ── Confetti celebration ── */
function burstConfetti() {
  const confettiColors = ["#EAFF00","#A855F7","#FFD700","#FF6B6B","#4ECDC4","#FFF"];
  const container = document.createElement('div');
  container.className = 'confetti-container';

  /* Falling confetti */
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    const duration = 2 + Math.random() * 3;
    const delay = Math.random() * 1.5;
    piece.style.animation = `confetti-fall ${duration}s ${delay}s ease-in forwards`;
    container.appendChild(piece);
  }

  /* Popper bursts from top 3 podium boxes */
  const popper = document.createElement('div');
  popper.className = 'popper-burst';
  const podiumBoxes = document.querySelectorAll('.podium-box');
  podiumBoxes.forEach((box) => {
    const rect = box.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.3;
    for (let i = 0; i < 24; i++) {
      const dot = document.createElement('div');
      dot.className = 'popper-dot';
      dot.style.left = cx + 'px';
      dot.style.top = cy + 'px';
      dot.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.5;
      const dist = 60 + Math.random() * 120;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const dur = 1 + Math.random() * 1;
      dot.style.setProperty('--tx', tx + 'px');
      dot.style.setProperty('--ty', ty + 'px');
      dot.style.animation = `popper-burst-anim ${dur}s ease-out forwards`;
      dot.animate([
        { transform: `translate(0,0) scale(1)`, opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.4)`, opacity: 0 }
      ], { duration: dur * 1000, easing: 'cubic-bezier(0,.5,.5,1)', fill: 'forwards' });
      popper.appendChild(dot);
    }
  });

  document.body.appendChild(popper);
  document.body.appendChild(container);

  setTimeout(() => popper.remove(), 2500);
  setTimeout(() => container.remove(), 5000);
}

/* ── Refresh button ── */
refreshBtn.addEventListener('click', () => {
  fetchMarks();
});

/* ── Initial load + auto-refresh ── */
fetchMarks();
setInterval(fetchMarks, CONFIG.REFRESH_INTERVAL * 1000);
