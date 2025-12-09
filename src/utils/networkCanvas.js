// src/utils/networkCanvas.js
// Highlighted Version: brighter lines, glowing nodes, clean full-area motion

export default function initNetworkCanvas(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;

  /* -----------------------------------------------------
     RETINA / RESIZE HANDLING
  ----------------------------------------------------- */
  const setSize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  setSize();

  /* -----------------------------------------------------
     CONFIG — tuned for visibility + elegance
  ----------------------------------------------------- */
  const NODE_COUNT = 110;       // increased for larger canvas area
  const MAX_SPEED = 0.22;       // smoother movement
  const LINK_DISTANCE = 220;    // more line connections

  const NODE_MIN_R = 1.4;
  const NODE_MAX_R = 2.6;

  const nodes = [];
  const rand = (min, max) => Math.random() * (max - min) + min;

  /* -----------------------------------------------------
     INITIALIZE NODES (full canvas coverage)
  ----------------------------------------------------- */
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-MAX_SPEED, MAX_SPEED),
      vy: rand(-MAX_SPEED, MAX_SPEED),
      r: rand(NODE_MIN_R, NODE_MAX_R),
    });
  }

  let frameId;

  /* -----------------------------------------------------
     MAIN ANIMATION LOOP
  ----------------------------------------------------- */
  function update() {
    ctx.clearRect(0, 0, width, height);

    /* --------------------
       MOVE NODES
    -------------------- */
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // wrap cleanly inside canvas
      if (n.x < 0) n.x = width;
      else if (n.x > width) n.x = 0;
      if (n.y < 0) n.y = height;
      else if (n.y > height) n.y = 0;
    }

    /* --------------------
       DRAW CONNECTION LINES
    -------------------- */
    ctx.lineWidth = 1.1;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < LINK_DISTANCE) {
          const t = 1 - dist / LINK_DISTANCE; // fade with distance
          let alpha = 0.38 * t;               // brighter lines

          ctx.strokeStyle = `rgba(70, 70, 90, ${alpha})`; // Dark blue/grey lines
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    /* --------------------
       DRAW NODES (with glow)
    -------------------- */
    for (const n of nodes) {
      ctx.shadowColor = "rgba(80, 80, 100, 0.45)"; // Dark blue/grey glow
      ctx.shadowBlur = 8;

      ctx.fillStyle = `rgba(100, 160, 255, 0.95)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0; // reset glow for next draw step
    }

    frameId = requestAnimationFrame(update);
  }

  frameId = requestAnimationFrame(update);

  /* -----------------------------------------------------
     RESIZE HANDLER
  ----------------------------------------------------- */
  const onResize = () => setSize();
  window.addEventListener("resize", onResize);

  /* -----------------------------------------------------
     CLEANUP FOR REACT UNMOUNT
  ----------------------------------------------------- */
  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", onResize);
  };
}
