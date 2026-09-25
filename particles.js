(function () {
  const canvas = document.querySelector('.particle-canvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isSmallScreen = window.matchMedia('(max-width: 760px)');
  const particles = [];
  const connectionDistance = 132;
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  const requestFrame = window.requestAnimationFrame || function (callback) {
    return window.setTimeout(callback, 1000 / 60);
  };
  const cancelFrame = window.cancelAnimationFrame || window.clearTimeout;

  function themeColors() {
    const styles = getComputedStyle(root);
    return {
      particle: styles.getPropertyValue('--accent').trim() || '#2563eb',
      line: styles.getPropertyValue('--accent').trim() || '#2563eb'
    };
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function createParticles() {
    particles.length = 0;
    const count = isSmallScreen.matches ? 28 : Math.min(58, Math.max(38, Math.floor((width * height) / 22000)));
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = reduceMotion.matches ? 0 : 0.12 + Math.random() * 0.3;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.2 + Math.random() * 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 0.3 + Math.random() * 0.45
      });
    }
  }

  function draw() {
    const colors = themeColors();
    context.clearRect(0, 0, width, height);

    particles.forEach(function (particle) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;
    });

    for (let i = 0; i < particles.length; i += 1) {
      const first = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const second = particles[j];
        const dx = first.x - second.x;
        const dy = first.y - second.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.2;
          context.strokeStyle = colors.line;
          context.globalAlpha = opacity;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }
    }

    context.globalAlpha = 1;
    particles.forEach(function (particle) {
      context.fillStyle = colors.particle;
      context.globalAlpha = particle.alpha;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;

    animationFrame = requestFrame(draw);
  }

  resize();
  createParticles();
  window.addEventListener('resize', function () {
    resize();
    createParticles();
  }, { passive: true });
  const listenToMediaChange = function (mediaQuery, listener) {
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
    }
  };
  listenToMediaChange(reduceMotion, createParticles);
  listenToMediaChange(isSmallScreen, createParticles);
  draw();

  window.addEventListener('pagehide', function () {
    cancelFrame(animationFrame);
  }, { once: true });
})();
