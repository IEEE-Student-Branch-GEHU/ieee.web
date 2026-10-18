'use client';

import { useEffect } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { getLegalContent, LEGAL_REVIEW_MARKER } from './legal-content';

const renderParagraph = paragraph => {
  if (typeof paragraph === 'string') return paragraph;

  return (
    <>
      {paragraph.before}
       <a href={paragraph.href} className="site-accent underline underline-offset-4">
        {paragraph.label}
      </a>
      {paragraph.after}
    </>
  );
};

const LegalPage = ({ kind = 'privacy' }) => {
  const content = getLegalContent(kind);

  useEffect(() => {
    const previousTitle = document.title;
    const existingRobots = document.querySelector('meta[name="robots"]');
    const previousRobotsContent = existingRobots?.getAttribute('content');
    const robots = existingRobots || document.createElement('meta');
    const createdRobots = !existingRobots;

    document.title = content.title;
    robots.setAttribute('name', 'robots');
    robots.setAttribute('content', 'noindex, nofollow');
    if (createdRobots) document.head.appendChild(robots);

    return () => {
      document.title = previousTitle;
      if (createdRobots) {
        robots.remove();
      } else if (previousRobotsContent === null) {
        existingRobots.removeAttribute('content');
      } else {
        existingRobots.setAttribute('content', previousRobotsContent);
      }
    };
  }, [content.title]);

  return (
    <div className="site-surface min-h-screen">
      <Navbar surface />

      <main className="site-surface px-6 pb-24 pt-36 sm:px-8" aria-labelledby="legal-page-title">
        <article className="mx-auto max-w-5xl">
          <header className="site-panel site-border rounded-[2rem] border p-8 shadow-sm sm:p-12">
            <p className="site-accent mb-4 font-sans text-xs font-bold uppercase tracking-[0.28em]">
              {content.eyebrow}
            </p>
            <h1 id="legal-page-title" className="site-text font-sans text-4xl font-bold tracking-tight sm:text-6xl">
              {content.title}
            </h1>
            <p className="site-muted mt-6 max-w-3xl font-body text-base leading-8 sm:text-lg">
              {content.summary}
            </p>
            <p role="status" className="site-panel site-border site-accent mt-8 rounded-2xl border px-4 py-3 font-body text-sm font-semibold leading-6">
              {LEGAL_REVIEW_MARKER}
            </p>
          </header>

          <div className="mt-8 space-y-6">
            {content.sections.map(section => (
              <section key={section.id} className="site-panel site-border rounded-[2rem] border p-8 sm:p-10" aria-labelledby={`${section.id}-heading`}>
                <h2 id={`${section.id}-heading`} className="site-text font-sans text-2xl font-bold tracking-tight sm:text-3xl">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={typeof paragraph === 'string' ? paragraph : `${section.id}-${index}`} className="site-muted max-w-4xl font-body text-base leading-8">
                      {renderParagraph(paragraph)}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>

      <Footer sectionLinkPrefix="/" />
    </div>
  );
};

export default LegalPage;
