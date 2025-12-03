export function initReveal(options = {}) {
  if (typeof window === "undefined") return () => {};

  const targets = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!targets.length) return () => {};

  const {
    threshold = 0.15,
    root = null,
    rootMargin = "0px 0px -10% 0px",
  } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || "0", 10);
          setTimeout(() => {
            el.classList.add("is-visible");
          }, delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold, root, rootMargin }
  );

  targets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });

  return () => observer.disconnect();
}

export function initTilt(selector, opts = {}) {
  if (typeof window === "undefined") return () => {};

  const elements =
    typeof selector === "string"
      ? Array.from(document.querySelectorAll(selector))
      : Array.from(selector || []);

  if (!elements.length) return () => {};

  const {
    maxTilt = 5,
    scaleOnHover = 1.03,
    perspective = 1000,
    ease = "0.25s ease",
  } = opts;

  const cleanupFns = [];

  elements.forEach((el) => {
    const baseX = parseFloat(el.dataset.tiltBaseX || "0");
    const baseY = parseFloat(el.dataset.tiltBaseY || "0");
    let rect = null;
    let raf = null;

    const updateRect = () => {
      rect = el.getBoundingClientRect();
    };

    updateRect();

    const handleMove = (event) => {
      if (!rect) return;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dx = (x - rect.width / 2) / rect.width;
      const dy = (y - rect.height / 2) / rect.height;
      const tiltX = (dy * maxTilt).toFixed(3);
      const tiltY = (-dx * maxTilt).toFixed(3);

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--tiltX", `${tiltX}deg`);
        el.style.setProperty("--tiltY", `${tiltY}deg`);
        el.style.setProperty("--tiltScale", scaleOnHover);
        el.style.transition = `transform ${ease}`;
        el.style.transform = `perspective(${perspective}px) rotateX(var(--tiltX)) rotateY(var(--tiltY)) scale(var(--tiltScale))`;
      });
    };

    const handleLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--tiltX", `${baseX}deg`);
        el.style.setProperty("--tiltY", `${baseY}deg`);
        el.style.setProperty("--tiltScale", "1");
        el.style.transition = `transform ${ease}`;
        el.style.transform = `perspective(${perspective}px) rotateX(var(--tiltX)) rotateY(var(--tiltY)) scale(var(--tiltScale))`;
      });
    };

    const handleResize = () => updateRect();

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", handleResize);

    cleanupFns.push(() => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", handleResize);
      if (raf) cancelAnimationFrame(raf);
    });
  });

  return () => cleanupFns.forEach((fn) => fn());
}
