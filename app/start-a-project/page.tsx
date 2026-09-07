import type { Metadata } from "next";
import Link from "next/link";
import ProjectForm from "./project-form";
import styles from "./project.module.css";

export const metadata: Metadata = {
  title: "Start a Project — Oussama",
  description: "Shape your next video with a creative brief for Oussama.",
};

export default function StartProjectPage() {
  return (
    <>
      <a className="skip-link" href="#project-main">Skip to content</a>
      <header className="navbar">
        <div className="container nav-inner">
          <Link href="/" className="logo" aria-label="Oussama home">OUSSAMA<span>®</span></Link>
          <Link href="/" className={styles.backLink}>← Back to portfolio</Link>
        </div>
      </header>
      <main id="project-main" className={`container ${styles.page}`}>
        <div className={styles.intro}>
          <p className="eyebrow">YOUR NEXT STORY STARTS HERE</p>
          <h1>Start a <span>Project.</span></h1>
          <p>Every great edit starts with a clear vision. Tell me about yours.</p>
        </div>
        <ProjectForm />
      </main>
    </>
  );
}
