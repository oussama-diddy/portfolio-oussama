"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import styles from "./project.module.css";

const projectTypes = ["YouTube Video", "Gaming Edit", "Short Form / Reel", "Promotional Video", "Cinematic Edit", "Other"];
const labels: Record<string, string> = {
  fullName: "Full Name", email: "Email Address", whatsapp: "WhatsApp Number",
  projectType: "Project Type",
  finalDuration: "Desired Final Video Duration", videoCount: "Number of Videos",
  description: "Project Description", style: "Editing Style / Reference",
  reference: "Reference Video URL", aspectRatio: "Aspect Ratio",
};

function Field({ name, children, wide = false, optional = false }: { name: string; children: ReactNode; wide?: boolean; optional?: boolean }) {
  return <div className={`${styles.field} ${wide ? styles.wide : ""}`}>
    <label htmlFor={name}>{labels[name]}{optional && <span> (optional)</span>}</label>
    {children}
  </div>;
}

function Card({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  return <section className={styles.card} aria-labelledby={`section-${number}`}>
    <div className={styles.cardHeading}><span className={styles.number}>{number}</span><div><h2 id={`section-${number}`}>{title}</h2><p>{description}</p></div></div>
    <div className={styles.grid}>{children}</div>
  </section>;
}

export default function ProjectForm() {
  const [review, setReview] = useState<[string, string][] | null>(null);
  const reviewRef = useRef<HTMLElement>(null);

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const message = [
      "New Project Request",
      "",
      `Name: ${value("fullName")}`,
      `Email: ${value("email") || "Not provided"}`,
      `WhatsApp: ${value("whatsapp")}`,
      "",
      `Project Type: ${value("projectType")}`,
      `Number of Videos: ${value("videoCount")}`,
      `Desired Final Video Duration: ${value("finalDuration")}`,
      "",
      "Project Description:",
      value("description"),
      "",
      "Editing Style / Reference:",
      value("style"),
      "",
      "Reference Video:",
      value("reference") || "Not provided",
      "",
      "Aspect Ratio:",
      value("aspectRatio"),
    ].join("\n");

    // Open directly during submission; the client confirms Send in WhatsApp.
    window.open(`https://wa.me/212705532747?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setReview(Array.from(data.entries()).map(([key, value]) => [key, String(value)]));
    requestAnimationFrame(() => reviewRef.current?.focus());
  }

  return <form className={styles.form} onSubmit={submitProject} onChange={() => setReview(null)}>
    <div className={styles.formNote}><span>THE CREATIVE BRIEF</span><p>All fields are required unless marked optional.</p></div>
    <Card number="01" title="Client Information" description="A little about the person behind the project.">
      <Field name="fullName"><input id="fullName" name="fullName" autoComplete="name" placeholder="Your full name" required maxLength={120} /></Field>
      <Field name="email" optional><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} /></Field>
      <Field name="whatsapp" wide><input id="whatsapp" name="whatsapp" type="tel" autoComplete="tel" placeholder="e.g. +212 600 000 000" required maxLength={40} aria-describedby="phone-hint" /><small id="phone-hint">Include your country code.</small></Field>
    </Card>
    <Card number="02" title="Project Details" description="Let’s define the shape of your edit.">
      <Field name="projectType"><select id="projectType" name="projectType" defaultValue="" required><option value="" disabled>Select a project type</option>{projectTypes.map(type => <option key={type}>{type}</option>)}</select></Field>
      <Field name="videoCount"><input id="videoCount" name="videoCount" type="number" min="1" step="1" placeholder="e.g. 1" required /></Field>
      <Field name="finalDuration" wide><input id="finalDuration" name="finalDuration" placeholder="e.g. 60 seconds per video" required maxLength={120} /></Field>
    </Card>
    <Card number="03" title="Project Requirements" description="The story, the feeling, and the details that matter.">
      <Field name="description" wide><textarea id="description" name="description" rows={5} placeholder="Tell me about your idea, audience, goals, and anything the video should include…" required maxLength={6000} /></Field>
      <Field name="style" wide><textarea id="style" name="style" rows={3} placeholder="Describe the pacing, mood, colors, music, or an editing style you love…" required maxLength={3000} /></Field>
      <Field name="reference" wide optional><input id="reference" name="reference" type="url" placeholder="https://youtube.com/watch?v=…" maxLength={2000} /></Field>
      <fieldset className={styles.ratios}><legend>Aspect Ratio</legend><div>{["16:9", "9:16", "1:1", "Other"].map((ratio, index) => <label key={ratio}><input type="radio" name="aspectRatio" value={ratio} required /><span><i className={styles[`ratio${index}`]} aria-hidden="true" />{ratio}</span></label>)}</div></fieldset>
    </Card>
    <div className={styles.actions}><p>Opens WhatsApp in a new tab. Review your message and press Send there.</p><button type="submit" className="button button-light">Send via WhatsApp <span aria-hidden="true">→</span></button></div>
    {review && <section ref={reviewRef} tabIndex={-1} className={styles.review} aria-labelledby="review-title">
      <p className="eyebrow">YOUR CREATIVE BRIEF</p><h2 id="review-title">Ready for a closer look.</h2><p>Review your details below. Nothing has been submitted. You can edit any field above.</p>
      <dl>{review.map(([key, value]) => <div key={key}><dt>{labels[key]}</dt><dd>{value || "Not provided"}</dd></div>)}</dl>
    </section>}
  </form>;
}
