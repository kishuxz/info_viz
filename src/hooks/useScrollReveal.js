import { useEffect } from "react";

export default function useScrollReveal(opts = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!elements.length) return undefined;

    const {
      threshold = 0.2,
      root = null,
      rootMargin = "0px 0px -10% 0px",
    } = opts;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.revealDelay || "0", 10);
            setTimeout(() => el.classList.add("is-visible"), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold, root, rootMargin }
    );

    elements.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [opts]);

  return null;
}
