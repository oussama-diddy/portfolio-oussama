"use client";

import { useEffect, useRef } from "react";

export function useAboutMotion() {
  const about = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = about.current;
    if (!section) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Map<Element, Animation>();
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animations.get(entry.target)?.play();
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    function reveal(element: Element | null, transform: string, delay = 0) {
      if (!element || preference.matches) return;
      const animation = element.animate([
        { opacity: 0, transform },
        { opacity: 1, transform: "translate(0, 0) scale(1)" },
      ], { duration: 820, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" });
      animation.pause();
      animation.onfinish = () => animation.cancel();
      animations.set(element, animation);
      revealObserver.observe(element);
    }

    reveal(section, "translateY(36px)");
    reveal(section.querySelector(".about-portrait"), "translateX(-50px) scale(0.96)", 100);
    section.querySelectorAll(".about-personal > *").forEach((element, index) => {
      reveal(element, "translateY(24px)", 260 + index * 120);
    });
    section.querySelectorAll(".about-description > *").forEach((element, index) => {
      reveal(element, "translateX(40px)", 180 + index * 140);
    });
    section.querySelectorAll(".stats > div").forEach((element, index) => {
      reveal(element, "translateY(20px)", index * 100);
    });

    let frame = 0;
    let active = false;
    let progress = 0;
    let lastTime = 0;
    const render = (time: number) => {
      frame = 0;
      if (preference.matches) return;
      const bounds = section.getBoundingClientRect();
      const target = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
      const elapsed = lastTime ? Math.min(64, time - lastTime) : 16;
      lastTime = time;
      progress += (target - progress) * (1 - Math.exp(-elapsed / 90));
      if (Math.abs(target - progress) < 0.0001) progress = target;
      section.style.setProperty("--about-progress", String(progress));
      section.style.setProperty("--about-parallax", `${(progress - 0.5) * 10}px`);
      if (active && progress !== target) frame = requestAnimationFrame(render);
      else lastTime = 0;
    };
    const schedule = () => {
      if (active && !frame && !preference.matches) frame = requestAnimationFrame(render);
    };
    const visibilityObserver = new IntersectionObserver(entries => {
      active = entries[0].isIntersecting;
      schedule();
    }, { rootMargin: "100px" });
    visibilityObserver.observe(section);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(section);
    const updatePreference = () => {
      if (preference.matches) {
        revealObserver.disconnect();
        animations.forEach(animation => animation.cancel());
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        section.style.removeProperty("--about-progress");
        section.style.removeProperty("--about-parallax");
      } else schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", updatePreference);
    return () => {
      cancelAnimationFrame(frame);
      revealObserver.disconnect();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      animations.forEach(animation => animation.cancel());
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", updatePreference);
      section.style.removeProperty("--about-progress");
      section.style.removeProperty("--about-parallax");
    };
  }, []);

  return about;
}
