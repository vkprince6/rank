/* ── Star background + GSAP entrance ── */
(function () {
  const container = document.getElementById('bgStars');
  const COUNT = 80;
  const stars = [];

  for (let i = 0; i < COUNT; i++) {
    const s = document.createElement('span');
    s.className = 'bg-star';
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    s.style.left = x + '%';
    s.style.top = y + '%';
    const size = Math.random() * 2.5 + 1;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    const dur = 2 + Math.random() * 4;
    const delay = Math.random() * 4;
    s.style.animation = `twinkle ${dur}s ${delay}s ease-in-out infinite`;
    container.appendChild(s);
    stars.push({ el: s, x, y, size });
  }

  /* Mouse proximity glow */
  document.addEventListener('mousemove', (e) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mx = (e.clientX / vw) * 100;
    const my = (e.clientY / vh) * 100;
    const radius = 14;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const dx = s.x - mx;
      const dy = s.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const t = 1 - dist / radius;
        s.el.style.opacity = 0.3 + t * 0.7;
        s.el.style.width = (s.size + t * 4) + 'px';
        s.el.style.height = (s.size + t * 4) + 'px';
        const glow = i % 3 === 0 ? '196,181,253' : '255,215,0';
        s.el.style.boxShadow = `0 0 ${4 + t * 10}px ${1 + t * 4}px rgba(${glow},${0.3 + t * 0.55})`;
        s.el.style.animation = 'none';
        s.el.style.animationPlayState = 'paused';
      } else {
        s.el.style.opacity = '';
        s.el.style.width = '';
        s.el.style.height = '';
        s.el.style.boxShadow = '';
        s.el.style.animation = '';
      }
    }
  });

  /* GSAP header + card entrance */
  if (typeof gsap !== 'undefined') {
    gsap.from('header',       { y: -30, opacity: 0, duration: .8, ease: 'expo.out' });
    gsap.from('.status-bar',  { y: 15,  opacity: 0, duration: .6, ease: 'expo.out', delay: .15 });
    gsap.from('.leaderboard', { y: 25,  opacity: 0, duration: .7, ease: 'expo.out', delay: .3 });
    gsap.from('.btn',         { y: 10,  opacity: 0, duration: .5, ease: 'expo.out', delay: .45 });
    gsap.from('footer',       { y: 8,   opacity: 0, duration: .4, ease: 'expo.out', delay: .55 });
  }
})();