'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BsGithub, BsInstagram, BsLinkedin, BsTwitterX } from 'react-icons/bs';
import Navbar from '../Navbar';
import Footer from '../Footer';
import MemberQr from './MemberQr';
import API_BASE_URL from '../../config';
import { fetchJson } from '../../lib/http';

const socialIcons = { linkedin: BsLinkedin, instagram: BsInstagram, twitter: BsTwitterX, github: BsGithub };

const MemberProfile = ({ memberId }) => {
  const [member, setMember] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    fetchJson(`${API_BASE_URL}/team/${encodeURIComponent(memberId)}`, { signal: controller.signal })
      .then(data => { setMember(data); setState('ready'); })
      .catch(error => {
        if (error.name === 'AbortError') return;
        setState(error.status === 404 ? 'missing' : 'error');
      });
    return () => controller.abort();
  }, [memberId]);

  const content = state === 'loading'
    ? <p role="status" className="site-muted text-center">Loading profile...</p>
    : state === 'missing'
       ? <div className="site-panel site-border rounded-3xl border p-8 text-center"><h1 id="member-profile-heading" className="site-text text-3xl font-bold">Member profile not found</h1><p className="site-muted mt-3">The requested public profile is not available.</p></div>
      : state === 'error'
         ? <div role="alert" className="site-panel site-border rounded-3xl border p-8 text-center"><h1 id="member-profile-heading" className="site-text text-3xl font-bold">Profile unavailable</h1><p className="site-muted mt-3">Please try again later.</p></div>
        : (
          <article className="site-panel site-border grid gap-8 rounded-3xl border p-6 shadow-sm md:grid-cols-[minmax(16rem,22rem)_1fr] md:p-10">
            <div className="space-y-5">
              <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                {member.image ? <img src={member.image} alt={member.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl font-bold text-primary/30" aria-hidden="true">{member.name?.slice(0, 1)}</div>}
              </div>
              <MemberQr member={member} />
            </div>
            <div className="min-w-0 space-y-6">
              <header>
              <p className="site-accent font-sans text-xs font-bold uppercase tracking-[0.22em]">{member.category || 'IEEE Student Branch'}</p>
                <h1 id="member-profile-heading" className="site-text mt-3 text-4xl font-bold tracking-tight">{member.name}</h1>
                <p className="site-accent mt-2 text-lg font-semibold">{member.role}</p>
              </header>
              {(member.committee || member.academicYear || member.branch || member.year) && <dl className="grid gap-4 border-y site-border py-5 sm:grid-cols-2">{[['Committee', member.committee], ['Academic year', member.academicYear], ['Branch', member.branch], ['Year', member.year]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt className="site-muted text-xs font-bold uppercase tracking-wider">{label}</dt><dd className="site-text mt-1">{value}</dd></div>)}</dl>}
              {member.bio && <p className="site-muted text-base leading-8">{member.bio}</p>}
              {[['Skills', member.skills], ['Interests', member.interests], ['Achievements', member.achievements]].filter(([, values]) => values?.length).map(([label, values]) => <section key={label}><h2 className="site-text text-xl font-bold">{label}</h2><ul className="site-muted mt-2 list-disc space-y-1 pl-5">{values.map(value => <li key={value}>{value}</li>)}</ul></section>)}
              {member.socials && <div className="flex flex-wrap gap-3 border-t site-border pt-5">{Object.entries(member.socials).filter(([key, value]) => socialIcons[key] && value).map(([key, value]) => { const Icon = socialIcons[key]; return <a key={key} href={value} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on ${key}`} className="site-accent inline-flex min-h-11 items-center gap-2 rounded-xl border site-border px-4 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"><Icon size={18} aria-hidden="true" />{key}</a>; })}</div>}
            </div>
          </article>
        );

  return <div className="site-surface min-h-screen"><Navbar surface /><main className="site-surface px-6 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-5xl"><a href="/community" className="site-accent mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline"><ArrowLeft size={16} aria-hidden="true" />Back to community</a>{content}</div></main><Footer sectionLinkPrefix="/" /></div>;
};

export default MemberProfile;
