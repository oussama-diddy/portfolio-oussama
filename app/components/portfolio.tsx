"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import SelectedWork from "./selected-work";
import { SectionTransition, useSectionTransitions } from "./section-transition";
import { useAboutMotion } from "./use-about-motion";

type IconName = "arrow" | "play" | "film" | "phone" | "spark" | "game" | "layers" | "sound";
function Icon({ name = "arrow", className = "" }: { name?: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    play: <path d="m9 5 11 7-11 7Z" />,
    film: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></>,
    phone: <><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4m-4-9 5 3-5 3Z"/></>,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>,
    game: <><path d="M7 7h10c2 0 3 2 4 9s-3 4-5 1H8c-2 3-6 6-5-1S5 7 7 7Z"/><path d="M6 12h5m-2.5-2.5v5M16 11v.1M18 14v.1"/></>,
    layers: <><path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/></>,
    sound: <path d="M4 9v6m4-10v14m4-17v20m4-16v12m4-9v6"/>,
  };
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const contactLinks = {
  whatsapp: "https://wa.me/212705532747",
  instagram: "https://www.instagram.com/oussama_sn17/",
};

function SocialIcon({ name }: { name: "whatsapp" | "instagram" }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "instagram" ? <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></> : <><path d="M20.8 11.6a8.8 8.8 0 0 1-13 7.7L3 20.6l1.3-4.7a8.8 8.8 0 1 1 16.5-4.3Z"/><path d="m8.2 7.5 1.4-.2 1.1 2.5-1 1.1a7.2 7.2 0 0 0 3.4 3.3l1-1 2.5 1.2-.2 1.4c-.2.9-1.4 1.3-2.3 1-3.5-.9-6.4-3.8-7-7-.2-.9.3-2 1.1-2.3Z"/></>}
  </svg>;
}

const services: { title: string; icon: IconName; description: string }[] = [
  { title: "Social Media Editing", icon: "film", description: "Engaging, platform-ready videos that give your brand a voice and keep your audience watching." },
  { title: "Short-Form Content", icon: "phone", description: "Reels, TikToks and Shorts with sharp hooks, clean captions and a rhythm that holds attention." },
  { title: "Ads & Promotional Videos", icon: "spark", description: "Purposeful edits that turn your message into a compelling story with a clear call to action." },
  { title: "Gaming Edits", icon: "game", description: "Your best moments, elevated with dynamic cuts, immersive sound and perfectly timed effects." },
  { title: "Cinematic Editing", icon: "sound", description: "Thoughtful pacing, rich color and detailed sound design that make every frame feel intentional." },
  { title: "Motion Graphics", icon: "layers", description: "Clean animated titles, graphic elements and transitions that bring another dimension to your story." },
];

// Replace public/hero-showcase.png, or point this path at your own /public image.
const heroShowcaseImage = "/hero-showcase.png";

function EditingVisual() {
  const visualRef = useRef<HTMLDivElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const visual = visualRef.current;
    const hero = visual?.closest<HTMLElement>(".hero");
    if (!visual || !hero) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let progress = 0;
    let frame = 0;
    let lastTime = 0;
    let previousTimecode = "";

    const render = () => {
      visual.style.setProperty("--scrub-progress", String(progress));
      visual.style.setProperty("--clip-shift", `${preference.matches ? 0 : -8 * progress}px`);
      const imageProgress = preference.matches ? 0 : progress;
      visual.style.setProperty("--preview-scale", String(1 + 0.08 * imageProgress));
      visual.style.setProperty("--preview-y", `${-2 * imageProgress}%`);
      visual.style.setProperty("--preview-brightness", String(1 - 0.08 * imageProgress));
      visual.style.setProperty("--preview-opacity", String(1 - 0.04 * imageProgress));
      const totalFrames = Math.round(progress * 20 * 24);
      const seconds = String(Math.floor(totalFrames / 24)).padStart(2, "0");
      const frames = String(totalFrames % 24).padStart(2, "0");
      const timecode = `00:00:${seconds}:${frames}`;
      if (timecodeRef.current && timecode !== previousTimecode) {
        timecodeRef.current.textContent = timecode;
        previousTimecode = timecode;
      }
    };
    const update = (time: number) => {
      frame = 0;
      const bounds = hero.getBoundingClientRect();
      // Start at the hero's document position; finish as it leaves the viewport.
      const target = Math.min(1, Math.max(0, -bounds.top / Math.max(1, bounds.height)));
      const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      progress = preference.matches ? target : progress + (target - progress) * (1 - Math.exp(-elapsed / 85));
      if (Math.abs(target - progress) < 0.0001) progress = target;
      render();
      if (progress !== target) frame = requestAnimationFrame(update);
      else lastTime = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(hero);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", schedule);
    };
  }, []);

  return <div ref={visualRef} className="editing-visual">
    <div className="editor-top"><span><i/> OUSSAMA / SHOWREEL</span><span>1920 × 1080 <span className="editor-dot">●</span></span></div>
    <div className="editor-screen cinematic-preview"><Image className="preview-image" src={heroShowcaseImage} alt="Cinematic coastal arch above the ocean at violet dusk" fill sizes="(max-width: 760px) 92vw, 600px" preload/><span className="preview-overlay" aria-hidden="true"/><span className="frame-corner top-left"/><span className="frame-corner bottom-right"/><span className="play-button" aria-hidden="true"><Icon name="play"/></span></div>
    <div className="editor-controls"><span ref={timecodeRef} className="timecode">00:00:00:00</span><span>◂ &nbsp; ▷ &nbsp; ▸</span><span>FIT &nbsp; ⛶</span></div>
    <div className="timeline"><div className="timeline-ruler"><span>00:00</span><span>00:05</span><span>00:10</span><span>00:15</span><span>00:20</span></div><div className="track"><b>V1</b><span className="clip c1">Opening scene</span><span className="clip c2">The story</span><span className="clip c3">Final frame</span></div><div className="track"><b>V2</b><span className="clip title-clip">T &nbsp; Every frame. A feeling.</span></div><div className="track"><b>A1</b><span className="audio-clip">{Array.from({ length: 65 }, (_, i) => <i key={i} style={{ height: `${5 + ((i * 17 + 7) % 19)}px` }}/>)}</span></div><div className="playhead"/></div>
    <div className="floating-note"><span className="note-icon"><Icon name="spark"/></span><div>Made to make you feel.<small>Not just another edit.</small></div><span className="note-star">✦</span></div>
  </div>;
}

function SectionHeading({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div className="section-heading"><div><p className="eyebrow"><span>{number} /</span> {eyebrow}</p><h2>{title}</h2></div>{children}</div>;
}

export default function Portfolio({ year }: { year: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navbar = useRef<HTMLElement>(null);
  const about = useAboutMotion();
  useSectionTransitions();

  useEffect(() => {
    const updateNavbar = () => {
      navbar.current?.classList.toggle("is-scrolled", window.scrollY > 16);
    };
    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const stopAnimations = () => {
      if (motionPreference.matches) animations.forEach(animation => animation.cancel());
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!motionPreference.matches) {
          const animation = entry.target.animate(
            [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    motionPreference.addEventListener("change", stopAnimations);
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => {
      observer.disconnect();
      motionPreference.removeEventListener("change", stopAnimations);
      animations.forEach(animation => animation.cancel());
    };
  }, []);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header ref={navbar} className="navbar"><div className="container nav-inner"><a href="#home" className="logo" aria-label="Oussama home">OUSSAMA<span>®</span></a><nav id="main-navigation" className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">{["Home", "About", "Services", "Work", "Contact"].map(item => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>)}</nav><a href="#contact" className="nav-cta">Let’s talk <Icon/></a><button className="menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "✕" : "☰"}</button></div></header>
    <main id="main">
      <SectionTransition><section id="home" className="hero container"><div className="hero-copy"><div className="availability"><span/> Available for freelance projects</div><p className="hero-kicker">VIDEO EDITOR & VISUAL STORYTELLER</p><h1>Stories Cut<br/>With <span>Purpose.</span></h1><p className="hero-description">Freelance Video Editor focused on cinematic storytelling, social media content, ads and high-retention edits.</p><div className="button-row"><a className="button button-light" href="#work">View My Work <Icon/></a><a className="button button-outline" href="#contact">Contact Me <Icon className="diagonal"/></a></div><div className="hero-signoff"><span className="tiny-line"/> GOOD STORIES DESERVE GREAT EDITS.</div></div><EditingVisual/><div className="hero-bottom"><span>FROM RAW FOOTAGE TO SOMETHING REMARKABLE.</span><a href="#about">SCROLL TO EXPLORE <span>↓</span></a></div></section></SectionTransition>
      <div className="specialties"><div className="container"><span>Cinematic storytelling</span><i>✦</i><span>Precision in every cut</span><i>✦</i><span>Built for attention</span><i>✦</i><span>Made with intention</span></div></div>
      <SectionTransition><section ref={about} id="about" className="section container"><SectionHeading number="01" eyebrow="A LITTLE ABOUT ME" title="About Me"/><div className="about-grid"><div className="about-profile"><div className="about-portrait"><Image src="/profile.jpg" alt="Oussama Snoussi" fill sizes="(max-width: 760px) 85vw, 360px" className="about-profile-image"/></div><div className="about-personal"><h3>OUSSAMA SNOUSSI</h3><p className="about-role">Video Editor &amp; Visual Storyteller</p><p className="about-age">22 years old</p></div></div><div className="about-description"><h3>More than cuts.<br/><span>A story worth watching.</span></h3><p className="body-copy">I&apos;m Oussama, a video editor focused on creating engaging, polished and story-driven content. I work on social media videos, promotional edits, gaming content and cinematic projects.</p><p className="body-copy">From the first cut to the final color grade, I bring care, creativity and a fresh perspective to every project.</p></div></div><div className="stats"><div><strong>100<span>+</span></strong><p>Edited Videos</p></div><div><Icon name="phone"/><strong className="stat-text">Social Media</strong><p>Content that connects</p></div><div><Icon name="spark"/><strong className="stat-text">Fast Turnaround</strong><p>On time. Every time.</p></div><div><Icon name="film"/><strong className="stat-text">Creative Storytelling</strong><p>A purpose behind every frame</p></div></div></section></SectionTransition>
      <SectionTransition><section id="services" className="section section-tinted"><div className="container reveal"><SectionHeading number="02" eyebrow="WHAT I BRING TO THE TIMELINE" title="Your vision. My craft."><p>From a quick reel to a cinematic story.<br/>The right edit makes all the difference.</p></SectionHeading><div className="services-grid">{services.map((service, i) => <article className="service-card" key={service.title}><div className="service-top"><span className="service-icon"><Icon name={service.icon}/></span><span>0{i + 1}</span></div><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></div></section></SectionTransition>
      <SelectedWork/>
      <section className="section section-tinted"><div className="container reveal"><SectionHeading number="04" eyebrow="A SIMPLE, COLLABORATIVE PROCESS" title="How I Work"><p>Clear communication. Thoughtful execution.<br/>A smooth process from start to finish.</p></SectionHeading><div className="workflow">{[["Brief & Direction", "We talk through your goals, audience and references to get the creative direction right."], ["Editing", "I shape the footage into a story with purposeful cuts, sound, color and motion."], ["Feedback & Revisions", "You share your thoughts. We refine the details until the edit feels right."], ["Final Delivery", "You receive polished, export-ready videos in the formats your platforms need."]].map(([title, text], i) => <article key={title}><span className="step-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section className="software-section container reveal"><p className="eyebrow">THE TOOLS BEHIND THE CRAFT</p><div className="software-grid">{[["Pr", "Adobe Premiere Pro"], ["Ae", "After Effects"], ["◉", "CapCut"], ["Ps", "Photoshop"]].map(([mark, name]) => <div className="software-card" key={name}><span className={`software-mark mark-${mark}`}>{mark}</span><span>{name}</span></div>)}</div></section>
      <section className="section container testimonials reveal"><SectionHeading number="05" eyebrow="GOOD WORK STARTS WITH GOOD PEOPLE" title="From the other side."><p>Sample testimonials<br/><span className="muted">Placeholder copy for future client feedback.</span></p></SectionHeading><div className="testimonial-grid">{[["Oussama understood the tone we were going for. The edit felt clean, the pacing was right, and the revision process was straightforward.", "Alex M.", "Brand founder", "AM"], ["The short-form edits were easy to work with and consistent across the series. I appreciated the attention to captions and timing.", "Sarah K.", "Content creator", "SK"], ["Good communication throughout the project. He brought a few creative ideas to the footage that made the final video feel more considered.", "Youssef B.", "Creative producer", "YB"]].map(([quote, name, role, initials]) => <figure className="testimonial" key={name}><span className="quote-mark">“</span><blockquote>{quote}</blockquote><figcaption><span className="avatar">{initials}</span><div><strong>{name}</strong><span>{role} · Sample</span></div></figcaption></figure>)}</div></section>
      <SectionTransition><section id="contact" className="contact-section container reveal"><div className="availability"><span/> OPEN FOR COLLABORATION</div><h2>Have a project<br/>in <span>mind?</span></h2><p>Let&apos;s create something people actually want to watch.</p><div className="button-row contact-social-buttons"><a className="button button-light" href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer"><SocialIcon name="whatsapp"/> WhatsApp</a><a className="button button-outline" href={contactLinks.instagram} target="_blank" rel="noopener noreferrer"><SocialIcon name="instagram"/> Instagram</a></div><div className="contact-details"><a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer">+212 705 532 747</a><a href={contactLinks.instagram} target="_blank" rel="noopener noreferrer">@oussama_sn17</a></div></section></SectionTransition>
    </main>
    <footer className="container footer"><div><a className="logo" href="#home">OUSSAMA<span>®</span></a><p>Video Editor · Stories with purpose.</p></div><div className="footer-center"><div><a className="footer-social-link" href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer"><SocialIcon name="whatsapp"/> WhatsApp</a><a className="footer-social-link" href={contactLinks.instagram} target="_blank" rel="noopener noreferrer"><SocialIcon name="instagram"/> Instagram</a></div><p>© {year} Oussama. All rights reserved.</p></div><a className="back-top" href="#home">Back to top <span>↑</span></a></footer>

  </>;
}

