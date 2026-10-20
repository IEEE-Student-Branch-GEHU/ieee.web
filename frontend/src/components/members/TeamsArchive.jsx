'use client';

import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import API_BASE_URL from '../../config';
import { fetchJson } from '../../lib/http';
import { getMemberProfilePath } from '../../lib/public-site';
import YearSelector, { ALL_YEARS } from './YearSelector';

const YEAR_PATTERN = /^\d{4}-\d{4}$/;

const normalizeYears = (payload) => Array.from(new Set(
  (Array.isArray(payload) ? payload : [])
    .filter((year) => typeof year === 'string' && YEAR_PATTERN.test(year)),
)).sort((left, right) => right.localeCompare(left));

const normalizeMembers = (payload) => (Array.isArray(payload) ? payload : [])
  .filter((member) => member && typeof member === 'object');

const getUrlState = (availableYears) => {
  const params = new URLSearchParams(window.location.search);
  const requestedYear = params.get('year');
  const requestedSearch = params.get('search') || '';
  const fallbackYear = availableYears[0] || ALL_YEARS;
  const year = requestedYear === ALL_YEARS || availableYears.includes(requestedYear)
    ? requestedYear
    : fallbackYear;

  return {
    year,
    search: requestedSearch,
    shouldNormalize: requestedYear !== year,
  };
};

const updateUrl = (year, search, { replace = false } = {}) => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  if (year) url.searchParams.set('year', year);
  else url.searchParams.delete('year');

  if (search) url.searchParams.set('search', search);
  else url.searchParams.delete('search');

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history[replace ? 'replaceState' : 'pushState']({}, '', nextUrl);
};

const getTeamUrl = (year) => {
  const params = new URLSearchParams();
  if (year !== ALL_YEARS) params.set('year', year);
  const query = params.toString();
  return `${API_BASE_URL}/team${query ? `?${query}` : ''}`;
};

const getInitials = (name) => String(name || '')
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase() || '—';

const memberMatchesSearch = (member, search) => {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [member.name, member.role, member.category, member.bio]
    .filter((field) => typeof field === 'string')
    .some((field) => field.toLowerCase().includes(query));
};

const MemberCard = ({ member }) => {
  const name = member.name || 'Unnamed member';
  const profilePath = getMemberProfilePath(member._id);

  return (
    <article className="site-panel site-border flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm">
      <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        {member.image ? (
          <img src={member.image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div
            role="img"
            aria-label={`${name} profile image unavailable`}
            className="site-muted flex h-full items-center justify-center px-6 text-center text-4xl font-bold"
          >
            {getInitials(member.name)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <p className="site-accent text-xs font-semibold uppercase tracking-[0.16em]">
          {member.category || 'Team member'}
        </p>
        <h2 className="site-text text-2xl font-bold tracking-tight">
          {profilePath ? (
            <a href={profilePath} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">
              {name}
            </a>
          ) : name}
        </h2>
        {member.role && <p className="site-accent font-semibold">{member.role}</p>}
        {member.bio && <p className="site-muted text-sm leading-7">{member.bio}</p>}
        {member.year && <p className="site-muted mt-auto pt-2 text-xs">Term: {member.year}</p>}
      </div>
    </article>
  );
};

const TeamsArchive = () => {
  const [years, setYears] = useState([]);
  const [yearsStatus, setYearsStatus] = useState('loading');
  const [yearsError, setYearsError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [listing, setListing] = useState(null);
  const [yearsAttempt, setYearsAttempt] = useState(0);
  const [listingAttempt, setListingAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve()
      .then(() => fetchJson(`${API_BASE_URL}/team/years`, { signal: controller.signal }))
      .then((payload) => {
        if (controller.signal.aborted) return;

        const nextYears = normalizeYears(payload);
        const nextUrlState = getUrlState(nextYears);
        setYears(nextYears);
        setSearchTerm(nextUrlState.search);
        setSelectedYear(nextUrlState.year);
        setYearsStatus('ready');
        setYearsError(null);

        if (nextUrlState.shouldNormalize || !new URLSearchParams(window.location.search).has('year')) {
          updateUrl(nextUrlState.year, nextUrlState.search, { replace: true });
        }
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return;
        setYearsStatus('error');
        setYearsError('Unable to load team years. Please try again.');
      });

    return () => controller.abort();
  }, [yearsAttempt]);

  useEffect(() => {
    if (yearsStatus !== 'ready' || selectedYear === null) return undefined;

    const controller = new AbortController();
    const requestYear = selectedYear;

    Promise.resolve()
      .then(() => fetchJson(getTeamUrl(requestYear), { signal: controller.signal }))
      .then((payload) => {
        if (controller.signal.aborted) return;
        setListing({ year: requestYear, status: 'ready', members: normalizeMembers(payload) });
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return;
        setListing({ year: requestYear, status: 'error', members: [] });
      });

    return () => controller.abort();
  }, [listingAttempt, selectedYear, yearsStatus]);

  useEffect(() => {
    if (yearsStatus !== 'ready') return undefined;

    const handlePopState = () => {
      const nextUrlState = getUrlState(years);
      setSearchTerm(nextUrlState.search);
      setSelectedYear(nextUrlState.year);
      if (nextUrlState.shouldNormalize) updateUrl(nextUrlState.year, nextUrlState.search, { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [years, yearsStatus]);

  const handleYearChange = (nextYear) => {
    const normalizedYear = nextYear === ALL_YEARS || years.includes(nextYear) ? nextYear : (years[0] || ALL_YEARS);
    if (normalizedYear === selectedYear) return;

    setListing({ year: normalizedYear, status: 'loading', members: [] });
    setSelectedYear(normalizedYear);
    updateUrl(normalizedYear, searchTerm);
  };

  const handleSearchChange = (event) => {
    const nextSearch = event.target.value;
    setSearchTerm(nextSearch);
    updateUrl(selectedYear, nextSearch, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    updateUrl(selectedYear, '', { replace: true });
  };

  const retryYears = () => {
    setYearsStatus('loading');
    setYearsError(null);
    setSelectedYear(null);
    setListing(null);
    setYearsAttempt((attempt) => attempt + 1);
  };

  const retryListing = () => {
    if (selectedYear === null) return;
    setListing({ year: selectedYear, status: 'loading', members: [] });
    setListingAttempt((attempt) => attempt + 1);
  };

  const currentListing = listing?.year === selectedYear ? listing : null;
  const visibleMembers = currentListing?.status === 'ready'
    ? currentListing.members.filter((member) => memberMatchesSearch(member, searchTerm))
    : [];

  return (
    <div className="site-surface min-h-screen">
      <Navbar surface />
      <main className="site-surface px-6 pb-24 pt-36 sm:px-8" aria-labelledby="teams-archive-title">
        <div className="mx-auto max-w-6xl">
          <header className="max-w-3xl">
            <p className="site-accent text-sm font-semibold uppercase tracking-[0.18em]">IEEE Student Branch GEHU</p>
            <h1 id="teams-archive-title" className="site-text mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Teams archive</h1>
            <p className="site-muted mt-5 max-w-2xl text-base leading-8 sm:text-lg">
              Browse the people who have helped lead and grow the student branch across the years.
            </p>
            <a href="/community/scan" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">
              Scan Member QR
            </a>
          </header>

          <section className="site-panel site-border mt-12 grid gap-6 rounded-2xl border p-5 shadow-sm md:grid-cols-[minmax(12rem,0.7fr)_minmax(16rem,1fr)] md:p-6" aria-label="Team archive filters">
            <YearSelector
              years={years}
              value={selectedYear || ALL_YEARS}
              onChange={handleYearChange}
              disabled={yearsStatus === 'loading'}
            />
            <form onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="team-search" className="site-text block text-sm font-semibold">Search team members</label>
              <div className="mt-2 flex gap-3">
                <input
                  id="team-search"
                  type="search"
                  name="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by name, role, category, or bio"
                  className="site-panel site-border site-text min-h-11 min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm placeholder:site-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="site-border site-text min-h-11 rounded-xl border px-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="mt-12" aria-live="polite" aria-busy={yearsStatus === 'loading' || currentListing?.status === 'loading'}>
            {yearsStatus === 'loading' && (
              <p role="status" className="site-muted py-16 text-center">Loading team years...</p>
            )}

            {yearsStatus === 'error' && (
              <div role="alert" className="site-panel site-border rounded-2xl border p-8 text-center">
                <h2 className="site-text text-2xl font-bold">Team archive unavailable</h2>
                <p className="site-muted mt-3">{yearsError}</p>
                <button
                  type="button"
                  onClick={retryYears}
                  className="mt-6 min-h-11 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primaryDark motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                >
                  Retry
                </button>
              </div>
            )}

            {yearsStatus === 'ready' && currentListing?.status === 'loading' && (
              <p role="status" className="site-muted py-16 text-center">Loading team members...</p>
            )}

            {yearsStatus === 'ready' && currentListing?.status === 'error' && (
              <div role="alert" className="site-panel site-border rounded-2xl border p-8 text-center">
                <h2 className="site-text text-2xl font-bold">Unable to load team members</h2>
                <p className="site-muted mt-3">Please try again to load this year&apos;s public member list.</p>
                <button
                  type="button"
                  onClick={retryListing}
                  className="mt-6 min-h-11 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primaryDark motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                >
                  Retry
                </button>
              </div>
            )}

            {yearsStatus === 'ready' && currentListing?.status === 'ready' && visibleMembers.length === 0 && (
              <div className="site-panel site-border rounded-2xl border p-8 text-center">
                <h2 className="site-text text-2xl font-bold">No team members found</h2>
                <p className="site-muted mt-3">
                  {searchTerm ? 'Try a different search term.' : 'There are no public member records for this selection.'}
                </p>
              </div>
            )}

            {yearsStatus === 'ready' && currentListing?.status === 'ready' && visibleMembers.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleMembers.map((member) => (
                  <MemberCard key={member._id || `${member.name}-${member.role}`} member={member} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer sectionLinkPrefix="/" />
    </div>
  );
};

export default TeamsArchive;
