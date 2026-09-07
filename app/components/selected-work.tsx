"use client";

import Image from "next/image";
import { SectionTransition } from "./section-transition";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "../data/projects";

export default function SelectedWork() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [videoError, setVideoError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = grid.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;

    const animations = new Map<Element, Animation[]>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animations.get(entry.target)?.forEach(animation => animation.play());
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    element.querySelectorAll<HTMLElement>(".project-card").forEach((card, index) => {
      const options: KeyframeAnimationOptions = {
        duration: 820,
        delay: index * 120,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      };
      const reveal = card.animate([
        { opacity: 0, transform: `translate(${index % 2 === 0 ? -50 : 50}px, 25px) scale(0.96)` },
        { opacity: 1, transform: "translate(0, 0) scale(1)" },
      ], options);
      const thumbnail = card.querySelector(".project-thumbnail");
      const zoom = thumbnail?.animate([{ transform: "scale(1.08)" }, { transform: "scale(1)" }], options);
      const cardAnimations = zoom ? [reveal, zoom] : [reveal];
      cardAnimations.forEach(animation => {
        animation.pause();
        // Release animated styles so the existing hover effects take over.
        animation.onfinish = () => animation.cancel();
      });
      animations.set(card, cardAnimations);
      observer.observe(card);
    });

    const stopAnimations = () => {
      observer.disconnect();
      animations.forEach(group => group.forEach(animation => animation.cancel()));
    };
    const onPreferenceChange = () => { if (preference.matches) stopAnimations(); };
    const onFocus = (event: FocusEvent) => {
      const card = (event.target as HTMLElement).closest(".project-card");
      if (!card) return;
      observer.unobserve(card);
      animations.get(card)?.forEach(animation => animation.cancel());
    };
    preference.addEventListener("change", onPreferenceChange);
    element.addEventListener("focusin", onFocus);
    return () => {
      stopAnimations();
      preference.removeEventListener("change", onPreferenceChange);
      element.removeEventListener("focusin", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected]);

  function closeProject() {
    video.current?.pause();
    dialog.current?.close();
    setSelected(null);
  }

  return <>
    <SectionTransition><section id="work" className="section container">
      <div className="section-heading"><div><p className="eyebrow"><span>03 /</span> A FEW FRAMES FROM MY WORLD</p><h2>Selected Work</h2></div><p>A little variety. A lot of intention.<br/><span className="muted">Sample projects · Demo footage</span></p></div>
      <div ref={grid} className="project-grid">{projects.map((project, index) =>
        <button type="button" className="project-card project-card-button" key={project.title} aria-label={`View project: ${project.title}`} aria-haspopup="dialog" onClick={() => { setVideoError(false); setSelected(project); }}>
          <span className="project-preview">
            <Image className="project-thumbnail" src={project.thumbnail} alt="" fill sizes="(max-width: 600px) 100vw, 50vw"/>
            <span className="project-number">{String(index + 1).padStart(2, "0")} / PROJECT</span>
            <span className="project-view">View Project <span aria-hidden="true">↗</span></span>
          </span>
          <span className="project-info"><span><span className="project-title">{project.title}</span><span className="project-category">{project.category}</span></span><span className="project-arrow" aria-hidden="true">↗</span></span>
        </button>
      )}</div>
    </section></SectionTransition>
    <dialog ref={dialog} className="project-dialog video-dialog" aria-labelledby="project-title" onCancel={event => { event.preventDefault(); closeProject(); }} onClose={() => setSelected(null)} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeProject();
    }}>
      <button type="button" className="dialog-close" onClick={closeProject} aria-label="Close project" autoFocus>✕</button>
      {selected && <>
        <div className="project-player"><video key={selected.videoUrl} ref={video} src={selected.videoUrl} poster={selected.thumbnail} controls playsInline preload="metadata" aria-label={`${selected.title} video`} onError={() => setVideoError(true)}/></div>
        <div className="dialog-content"><p className="eyebrow">{selected.category}</p><h2 id="project-title">{selected.title}</h2>
          {videoError && <p role="status">This video could not be loaded. Please try again later.</p>}
          {selected.externalUrl && <a className="button button-outline" href={selected.externalUrl} target="_blank" rel="noopener noreferrer">View full project ↗</a>}
        </div>
      </>}
    </dialog>
  </>;
}
