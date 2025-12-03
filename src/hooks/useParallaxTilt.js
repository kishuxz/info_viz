import { useEffect } from "react";

export default function useParallaxTilt(selector, opts = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const nodes =
      typeof selector === "string"
        ? Array.from(document.querySelectorAll(selector))
        : Array.from(selector || []);

    if (!nodes.length) return undefined;

    const {
      maxTilt = 3,
      scale = 1.03,
      perspective = 900,
      ease = "0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
    } = opts;

    const cleanups = [];

    nodes.forEach((node) => {
      let rect = node.getBoundingClientRect();
      let raf = null;

      const updateRect = () => { rect = node.getBoundingClientRect(); };

      const handleMove = (e) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = (x - rect.width / 2) / rect.width;
        const dy = (y - rect.height / 2) / rect.height;
        const tiltX = (dy * maxTilt).toFixed(3);
        const tiltY = (-dx * maxTilt).toFixed(3);

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          node.style.setProperty("--tiltX", `${tiltX}deg`);
          node.style.setProperty("--tiltY", `${tiltY}deg`);
          node.style.setProperty("--tiltScale", scale);
          node.style.transition = `transform ${ease}`;
          node.style.transform = `perspective(${perspective}px) rotateX(var(--tiltX)) rotateY(var(--tiltY)) scale(var(--tiltScale))`;
        });
      };

      const handleLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          node.style.setProperty("--tiltX", "0deg");
          node.style.setProperty("--tiltY", "0deg");
          node.style.setProperty("--tiltScale", "1");
          node.style.transition = `transform ${ease}`;
          node.style.transform = `perspective(${perspective}px) rotateX(var(--tiltX)) rotateY(var(--tiltY)) scale(var(--tiltScale))`;
        });
      };

      const handleResize = () => updateRect();

      node.addEventListener("mousemove", handleMove);
      node.addEventListener("mouseleave", handleLeave);
      window.addEventListener("resize", handleResize);

      cleanups.push(() => {
        node.removeEventListener("mousemove", handleMove);
        node.removeEventListener("mouseleave", handleLeave);
        window.removeEventListener("resize", handleResize);
        if (raf) cancelAnimationFrame(raf);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [selector, opts]);

  return null;
}
