// Create a small dot element
function createDot() {
  const dot = document.createElement('div');
  dot.classList.add('cursor-dot');
  document.body.appendChild(dot);
  return dot;
}

document.addEventListener('DOMContentLoaded', () => {
   if (window.matchMedia('(min-width: 700px)').matches === false) {
    return;
  }
  const dots = [];
  const numDots = 8;

  // Initialize dots
  for (let i = 0; i < numDots; i++) {
    dots.push(createDot());
  }

  let mouseX = 0;
  let mouseY = 0;

  // Update mouse coords on move
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Animate dots chasing the cursor
  function animate() {
    let x = mouseX;
    let y = mouseY;

    dots.forEach((dot, i) => {
      const nextDot = dots[i + 1] || dots[0];
      dot.style.left = x + 'px';
      dot.style.top  = y + 'px';
      dot.style.transform = `scale(${1 - i / numDots * 0.7})`;

      // move toward the next dot’s previous position
      const dx = nextDot._x ?? x;
      const dy = nextDot._y ?? y;
      x += (dx - x) * 0.3;
      y += (dy - y) * 0.3;

      // store for next tick
      dot._x = x;
      dot._y = y;
    });

    requestAnimationFrame(animate);
  }

  animate();
});


const clusterSVG = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">

    <!-- Soft spiral/branch path -->
    <path d="M10 90 C30 70, 60 80, 80 50" 
          stroke="var(--md-accent-fg-color)" 
          stroke-width="1.2" fill="none" />

    <!-- Central stylized pod -->
    <path d="M50 10
             C55 25, 70 40, 85 50
             C70 60, 55 75, 50 90
             C45 75, 30 60, 15 50
             C30 40, 45 25, 50 10 Z"
          fill="var(--md-accent-fg-color)" opacity="0.12" />

    <!-- Floating dots -->
    <circle cx="65" cy="25" r="1.5" fill="var(--md-accent-fg-color)" />
    <circle cx="75" cy="40" r="2" fill="var(--md-accent-fg-color)" />
    <circle cx="80" cy="60" r="1.2" fill="var(--md-accent-fg-color)" />
    <circle cx="70" cy="75" r="1.8" fill="var(--md-accent-fg-color)" />
    <circle cx="55" cy="85" r="1.4" fill="var(--md-accent-fg-color)" />
  </svg>
`;

const cluster = document.createElement('div');
cluster.className = 'corner-cluster';
cluster.innerHTML = clusterSVG;
document.body.appendChild(cluster);