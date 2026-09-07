"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const icons = [
  { kind: "Pr", left: "3%", top: "12%", x: 12, y: -28, rotate: -12 },
  { kind: "Ae", left: "92%", top: "18%", x: -16, y: 32, rotate: 10 },
  { kind: "Ps", left: "7%", top: "71%", x: 18, y: -20, rotate: 8 },
  { kind: "capcut", left: "95%", top: "76%", x: -12, y: -30, rotate: -10 },
  { kind: "timeline", left: "2%", top: "43%", x: 14, y: 24, rotate: -8 },
  { kind: "play", left: "94%", top: "47%", x: -10, y: -22, rotate: 12 },
  { kind: "camera", left: "18%", top: "91%", x: 20, y: -16, rotate: -10 },
  { kind: "film", left: "79%", top: "8%", x: -18, y: 20, rotate: 14 },
  { kind: "cut", left: "4%", top: "88%", x: 10, y: -32, rotate: 18 },
  { kind: "waveform", left: "88%", top: "92%", x: -22, y: -18, rotate: -8 },
] as const;

function EditingMark({ kind }: { kind: typeof icons[number]["kind"] }) {
  return <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" focusable="false">
    {(["Pr", "Ae", "Ps"] as string[]).includes(kind) && <><rect x="3" y="3" width="26" height="26" rx="5"/><text x="16" y="21" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="600">{kind}</text></>}
    {kind === "capcut" && <path d="m6 7 20 15v4H6v-4L26 7M6 11V6h20v5L6 26"/>}
    {kind === "timeline" && <><path d="M4 7h24M4 12h24M12 4v24"/><rect x="5" y="16" width="9" height="4" rx="1"/><rect x="17" y="16" width="10" height="4" rx="1"/><rect x="5" y="23" width="22" height="4" rx="1"/></>}
    {kind === "play" && <><circle cx="16" cy="16" r="12"/><path d="m13 10 9 6-9 6Z"/></>}
    {kind === "camera" && <><path d="m11 8 2-3h6l2 3h6v18H5V8Z"/><circle cx="16" cy="17" r="6"/></>}
    {kind === "film" && <><rect x="4" y="4" width="24" height="24" rx="2"/><path d="M10 4v24M22 4v24M4 10h6m-6 6h6m-6 6h6m12-12h6m-6 6h6m-6 6h6"/></>}
    {kind === "cut" && <><circle cx="8" cy="8" r="4"/><circle cx="8" cy="24" r="4"/><path d="m11 11 15 15M11 21 26 6"/></>}
    {kind === "waveform" && <path d="M4 13v6m4-10v14m4-18v22m4-16v10m4-18v26m4-20v14m4-10v6"/>}
  </svg>;
}

export default function EditingBackground() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = layer.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let progress = 0;
    let lastTime = 0;
    let range = 1;
    const render = (time: number) => {
      frame = 0;
      const target = Math.min(1, Math.max(0, window.scrollY / range));
      const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      progress += (target - progress) * (1 - Math.exp(-elapsed / 100));
      if (Math.abs(target - progress) < 0.0001) progress = target;
      element.style.setProperty("--editing-scroll", String(progress));
      if (progress !== target) frame = requestAnimationFrame(render);
      else lastTime = 0;
    };
    const schedule = () => {
      if (!frame && !preference.matches) frame = requestAnimationFrame(render);
    };
    const measure = () => {
      range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      schedule();
    };
    const updatePreference = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (preference.matches) {
        progress = 0;
        element.style.removeProperty("--editing-scroll");
      } else measure();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    preference.addEventListener("change", updatePreference);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      preference.removeEventListener("change", updatePreference);
    };
  }, []);

  return <div ref={layer} className="editing-background" aria-hidden="true">
    {icons.map(icon => <span key={icon.kind} className="editing-background-icon" style={{ left: icon.left, top: icon.top, "--drift-x": `${icon.x}px`, "--drift-y": `${icon.y}px`, "--icon-angle": `${icon.rotate}deg` } as CSSProperties}><EditingMark kind={icon.kind}/></span>)}
  </div>;
}
