"use client";

import { useEffect, type ReactNode } from "react";

export function SectionTransition({ children }: { children: ReactNode }) {
  return <div className="section-depth"><div className="section-depth-surface">{children}</div></div>;
}

export function useSectionTransitions() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".section-depth")).map(element => ({
      element,
      surface: element.firstElementChild as HTMLElement,
      top: 0,
      height: 1,
    }));
    let frame = 0;
    let scroll = window.scrollY;
    let lastTime = 0;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const smooth = (value: number) => value * value * (3 - 2 * value);
    const render = (time: number) => {
      frame = 0;
      const target = window.scrollY;
      const elapsed = lastTime ? Math.min(64, time - lastTime) : 16;
      lastTime = time;
      scroll += (target - scroll) * (1 - Math.exp(-elapsed / 85));
      if (Math.abs(target - scroll) < 0.1) scroll = target;
      const viewport = window.innerHeight;
      sections.forEach(({ surface, top, height }) => {
        const position = top - scroll;
        // Entry completes early; exit begins only as the section's bottom leaves.
        const entering = smooth(clamp((position - viewport * 0.55) / (viewport * 0.45)));
        const leaving = smooth(clamp((viewport * 0.45 - (position + height)) / (viewport * 0.45)));
        surface.style.transform = `perspective(1400px) translateY(${30 * entering - 20 * leaving}px) rotateX(${-4 * entering + 5 * leaving}deg) scale(${1 - 0.03 * entering - 0.04 * leaving})`;
        surface.style.opacity = String(1 - 0.3 * entering - 0.35 * leaving);
        surface.style.setProperty("--section-shade", String((entering + leaving) * 0.08));
      });
      if (scroll !== target) frame = requestAnimationFrame(render);
      else lastTime = 0;
    };
    const schedule = () => {
      if (!frame && !preference.matches) frame = requestAnimationFrame(render);
    };
    const measure = () => {
      sections.forEach(section => {
        // Measure the untransformed shell so transforms cannot feed back into progress.
        const bounds = section.element.getBoundingClientRect();
        section.top = bounds.top + window.scrollY;
        section.height = bounds.height;
      });
      schedule();
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      scroll = window.scrollY;
      sections.forEach(({ surface }) => {
        surface.style.removeProperty("transform");
        surface.style.removeProperty("opacity");
        surface.style.removeProperty("--section-shade");
      });
    };
    const updatePreference = () => { reset(); if (!preference.matches) measure(); };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    sections.forEach(({ element }) => observer.observe(element));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    preference.addEventListener("change", updatePreference);
    measure();
    return () => {
      reset();
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      preference.removeEventListener("change", updatePreference);
    };
  }, []);
}
