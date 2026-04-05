/* ════════════════════════════
   GHOST RUNNER — Climb Animation
   Pure JS + CSS (no GSAP needed)
═══════════════════════════ */

(function () {
  let previousData = null;

  /* Load previous state */
  function loadState() {
    try {
      const saved = sessionStorage.getItem('leaderboard_state');
      if (saved) previousData = JSON.parse(saved);
    } catch (_) {
      previousData = null;
    }
  }

  /* Save current state */
  function saveState(data) {
    try {
      sessionStorage.setItem('leaderboard_state', JSON.stringify(data));
    } catch (_) {}
  }

  /* Find previous position of a name */
  function findPreviousPosition(name) {
    if (!previousData) return null;
    for (let i = 0; i < previousData.length; i++) {
      if (previousData[i].name === name) return i + 1;
    }
    return null;
  }

  /* Check if a climb animation should trigger */
  function detectClimb(data) {
    if (!previousData || previousData.length < 2) return null;

    const oldTopNames = previousData.slice(0, 3).map(r => r.name);
    const newTop1 = data[0];
    if (!newTop1) return null;

    /* New #1 was not in previous top 3 → climb! */
    if (oldTopNames.includes(newTop1.name)) return null;

    const oldPos = findPreviousPosition(newTop1.name);
    if (!oldPos) {
      /* Brand new entry jumped to #1 — animate from bottom */
      return {
        climber: newTop1.name,
        marks: data[0].marks,
        fromRank: 10, /* show at bottom of ladder */
      };
    }

    const newMarks = data[0].marks;
    return {
      climber: newTop1.name,
      marks: newMarks,
      fromRank: Math.min(oldPos, 10),
    };
  }

  /* Build the overlay ladder */
  function createOverlay(data, climbInfo) {
    const overlay = document.createElement('div');
    overlay.className = 'climb-overlay';
    overlay.id = 'climbOverlay';

    const ladder = document.createElement('div');
    ladder.className = 'climb-ladder';
    ladder.id = 'climbLadder';
    overlay.appendChild(ladder);

    document.body.appendChild(overlay);

    const slots = buildSlots(data, climbInfo, ladder);
    return { overlay, ladder, slots };
  }

  /* Build visual slot elements */
  function buildSlots(data, climbInfo, ladder) {
    const slots = [];
    const top10 = data.slice(0, 10);

    for (let i = top10.length - 1; i >= 0; i--) {
      const rank = i + 1;
      const row = top10[i];
      const isClimber = row.name === climbInfo.climber;

      const slotDiv = document.createElement('div');
      slotDiv.className = 'climb-slot';
      if (rank === 1) slotDiv.classList.add('is-top1');
      if (rank === 2) slotDiv.classList.add('is-top2');
      if (rank === 3) slotDiv.classList.add('is-top3');
      if (isClimber) slotDiv.classList.add('is-climber');
      slotDiv.dataset.rank = rank;
      slotDiv.dataset.name = row.name;
      slotDiv.dataset.marks = row.marks;
      slotDiv.innerHTML = `
        <span class="climb-slot-rank">#${String(rank).padStart(2, '0')}</span>
        <span class="climb-slot-name">${escapeHTML(row.name)}</span>
        <span class="climb-slot-score">${Number(row.marks).toLocaleString()}</span>
      `;
      ladder.appendChild(slotDiv);
      slots.push(slotDiv);
    }

    return slots;
  }

  /* Animate the climb */
  function animateClimb(overlay, ladder, climbInfo) {
    const slots = ladder.querySelectorAll('.climb-slot');

    /* Step 1: Add 'show' class to all — CSS nth-child does stagger */
    requestAnimationFrame(() => {
      slots.forEach((slot) => slot.classList.add('show'));
    });

    /* Step 2: After all visible, climber starts moving up */
    const totalShowTime = 700;

    setTimeout(() => {
      /* Find the climber slot */
      const climberSlot = ladder.querySelector('.is-climber');
      if (!climberSlot) { closeOverlay(overlay); return; }

      /* Get all sibling slots above the climber */
      const allSlots = Array.from(ladder.querySelectorAll('.climb-slot'));
      const climberIndex = allSlots.indexOf(climberSlot);

      /* Move climber up one slot at a time */
      climbSteps(overlay, ladder, allSlots, climberIndex, 0, climbInfo);
    }, totalShowTime);
  }

  /* Recursive step — move climber up one position */
  function climbSteps(overlay, ladder, allSlots, climberIdx, step, climbInfo) {
    if (climberIdx === 0) {
      /* Reached the top! */
      finishClimb(overlay, climbInfo);
      return;
    }

    /* Animate climber bumping up */
    const climberSlot = allSlots[climberIdx];
    const aboveSlot = allSlots[climberIdx - 1];

    /* Displace the person above */
    if (aboveSlot) aboveSlot.classList.add('is-displaced');
    climberSlot.classList.add('is-bumping');

    /* Swap positions after animation */
    setTimeout(() => {
      if (aboveSlot) aboveSlot.classList.remove('is-displaced');
      climberSlot.classList.remove('is-bumping');

      /* Update rank numbers in DOM */
      // Climber takes above's rank
      const currentClimberRank = ladder.querySelector('.is-climber');
      if (currentClimberRank) {
        const rankEl = currentClimberRank.querySelector('.climb-slot-rank');
        if (rankEl) rankEl.textContent = `#${String(climberIdx).padStart(2, '0')}`;
      }

      /* Swap DOM elements: climber moves above the displaced */
      if (aboveSlot && aboveSlot.parentNode) {
        aboveSlot.parentNode.insertBefore(climberSlot, aboveSlot);
      }

      climbSteps(overlay, ladder, Array.from(ladder.querySelectorAll('.climb-slot')), climberIdx - 1, step + 1, climbInfo);
    }, 500);
  }

  /* Climber reached #1 — pulse and close */
  function finishClimb(overlay, climbInfo) {
    const climberSlot = overlay.querySelector('.is-climber');
    if (climberSlot) {
      /* Update rank to #01 */
      const rankEl = climberSlot.querySelector('.climb-slot-rank');
      if (rankEl) rankEl.textContent = '#01';
      climberSlot.classList.add('arrived');
    }

    /* Close after celebration pulse */
    setTimeout(() => closeOverlay(overlay), 1600);
  }

  /* Fade out and remove overlay */
  function closeOverlay(overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 400);
  }

  /* XSS helper */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* Public API — call after data is fetched */
  window.triggerClimbAnimation = function (data) {
    loadState();
    const climbInfo = detectClimb(data);
    // Save current state for next comparison
    saveState(data);

    if (!climbInfo) return; /* No climb detected or first load */
    // Don't animate if climber was already in a higher position somehow
    if (climbInfo.fromRank <= 1) return;

    const { overlay } = createOverlay(data, climbInfo);
    animateClimb(overlay, document.getElementById('climbLadder') || overlay.querySelector('#climbLadder'), climbInfo);
  };
})();
