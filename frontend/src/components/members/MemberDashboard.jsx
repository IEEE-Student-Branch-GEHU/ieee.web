'use client';

import { useEffect, useState } from 'react';
import { Check, FileText, Loader2, LogOut, Save, Trash2, Upload, UserRound } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { clearMemberToken, logoutMember, memberFetchJson } from '../../lib/member-api';
import { getStableMemberId } from '../../lib/public-site';

const EMPTY_PROFILE = {
  bio: '',
  committee: '',
  academicYear: '',
  branch: '',
  skills: [],
  interests: [],
  achievements: [],
  socials: {},
};

const SOCIAL_FIELDS = ['linkedin', 'instagram', 'twitter', 'github'];

const profileForForm = (profile) => ({
  ...EMPTY_PROFILE,
  ...(profile || {}),
  skills: Array.isArray(profile?.skills) ? profile.skills : [],
  interests: Array.isArray(profile?.interests) ? profile.interests : [],
  achievements: Array.isArray(profile?.achievements) ? profile.achievements : [],
  socials: { ...(profile?.socials || {}) },
});

const listValue = value => (Array.isArray(value) ? value.join('\n') : '');

const MemberDashboard = () => {
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [certificates, setCertificates] = useState([]);
  const [pageState, setPageState] = useState('loading');
  const [profileSaving, setProfileSaving] = useState(false);
  const [certificateSaving, setCertificateSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [certificateForm, setCertificateForm] = useState({ title: '', issuer: '', issuedAt: '', visibility: 'private', file: null });

  const loadDashboard = async () => {
    setPageState('loading');
    setError('');
    try {
      const [accountData, certificateData] = await Promise.all([
        memberFetchJson('/member/me'),
        memberFetchJson('/member/certificates'),
      ]);
      setAccount(accountData);
      setProfile(profileForForm(accountData?.profile));
      setCertificates(Array.isArray(certificateData) ? certificateData : []);
      setPageState('ready');
    } catch (requestError) {
      setError(requestError.message || 'Unable to load your member dashboard.');
      setPageState('error');
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateList = (field, value) => {
    setProfile(current => ({
      ...current,
      [field]: value.split(/\r?\n/).map(item => item.trim()).filter(Boolean),
    }));
  };

  const updateSocial = (field, value) => {
    setProfile(current => ({ ...current, socials: { ...current.socials, [field]: value } }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setMessage('');
    setError('');
    try {
      const data = await memberFetchJson('/member/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          bio: profile.bio,
          committee: profile.committee,
          academicYear: profile.academicYear,
          branch: profile.branch,
          skills: profile.skills,
          interests: profile.interests,
          achievements: profile.achievements,
          socials: profile.socials,
        }),
      });
      setProfile(profileForForm(data.profile));
      setAccount(current => ({ ...current, profile: data.profile }));
      setMessage('Profile changes saved.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to save profile changes.');
    } finally {
      setProfileSaving(false);
    }
  };

  const uploadCertificate = async (event) => {
    event.preventDefault();
    if (!certificateForm.file) {
      setError('Choose a PDF or image certificate before uploading.');
      return;
    }
    setCertificateSaving(true);
    setMessage('');
    setError('');
    try {
      const body = new FormData();
      body.append('title', certificateForm.title);
      body.append('issuer', certificateForm.issuer);
      body.append('issuedAt', certificateForm.issuedAt);
      body.append('visibility', certificateForm.visibility);
      body.append('certificate', certificateForm.file);
      const certificate = await memberFetchJson('/member/certificates', { method: 'POST', body });
      setCertificates(current => [certificate, ...current]);
      setCertificateForm({ title: '', issuer: '', issuedAt: '', visibility: 'private', file: null });
      event.target.reset();
      setMessage('Certificate uploaded.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to upload certificate.');
    } finally {
      setCertificateSaving(false);
    }
  };

  const changeVisibility = async (certificate, visibility) => {
    setError('');
    try {
      const updated = await memberFetchJson(`/member/certificates/${encodeURIComponent(certificate._id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ visibility }),
      });
      setCertificates(current => current.map(item => item._id === updated._id ? updated : item));
      setMessage('Certificate visibility updated.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to update certificate visibility.');
    }
  };

  const deleteCertificate = async (certificate) => {
    if (!window.confirm(`Delete ${certificate.title || 'this certificate'}?`)) return;
    setError('');
    try {
      await memberFetchJson(`/member/certificates/${encodeURIComponent(certificate._id)}`, { method: 'DELETE' });
      setCertificates(current => current.filter(item => item._id !== certificate._id));
      setMessage('Certificate deleted.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete certificate.');
    }
  };

  const handleLogout = async () => {
    await logoutMember();
    clearMemberToken();
    window.location.assign('/member/login');
  };

  if (pageState === 'loading') {
    return <div className="site-surface flex min-h-screen items-center justify-center"><p role="status" className="site-muted inline-flex items-center gap-2 text-sm font-semibold">Loading member dashboard <Loader2 size={16} className="animate-spin" aria-hidden="true" /></p></div>;
  }

  if (pageState === 'error') {
    return <div className="site-surface flex min-h-screen items-center justify-center px-6"><div className="site-panel site-border max-w-lg rounded-2xl border p-8 text-center"><h1 className="site-text text-2xl font-bold">Dashboard unavailable</h1><p role="alert" className="site-muted mt-3 leading-7">{error}</p><button type="button" onClick={loadDashboard} className="mt-6 min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primaryDark">Try again</button></div></div>;
  }

  return (
    <div className="site-surface min-h-screen">
      <Navbar surface />
      <main className="site-surface px-6 pb-24 pt-36 sm:px-8" aria-labelledby="member-dashboard-title">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col gap-6 border-b site-border pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="site-accent text-xs font-bold uppercase tracking-[0.18em]">Member portal</p>
              <h1 id="member-dashboard-title" className="site-text mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Your community profile</h1>
              <p className="site-muted mt-3 text-base leading-7">Manage the approved public details and private certificate records linked to your account.</p>
            </div>
            <button type="button" onClick={handleLogout} className="site-border site-text inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"><LogOut size={16} aria-hidden="true" /> Sign out</button>
          </header>

          {(message || error) && <div className={`mt-8 rounded-xl border p-4 text-sm font-semibold ${error ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200' : 'site-border bg-primary/5 site-accent'}`} role={error ? 'alert' : 'status'}>{error || message}</div>}

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <section className="site-panel site-border rounded-2xl border p-6 shadow-sm sm:p-8" aria-labelledby="profile-edit-title">
              <div className="flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><UserRound size={20} aria-hidden="true" /></div><div><h2 id="profile-edit-title" className="site-text text-2xl font-bold">Edit public profile</h2><p className="site-muted mt-2 text-sm leading-6">Name, role, category, year, rank, and image remain administrator-managed.</p></div></div>
              <form onSubmit={saveProfile} className="mt-8 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><span className="site-muted block text-xs font-bold uppercase tracking-wider">Name</span><p className="site-text mt-2 font-semibold">{account?.profile?.name || 'Not assigned'}</p></div>
                  <div><span className="site-muted block text-xs font-bold uppercase tracking-wider">Role</span><p className="site-text mt-2 font-semibold">{account?.profile?.role || 'Not assigned'}</p></div>
                </div>
                <div><label htmlFor="member-profile-bio" className="site-text block text-sm font-semibold">Short bio</label><textarea id="member-profile-bio" maxLength={2000} value={profile.bio} onChange={event => setProfile({ ...profile, bio: event.target.value })} className="site-panel site-border site-text mt-2 min-h-28 w-full rounded-xl border px-3 py-2" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['committee', 'Committee'],
                    ['academicYear', 'Academic year'],
                    ['branch', 'Branch'],
                  ].map(([field, label]) => <div key={field}><label htmlFor={`member-profile-${field}`} className="site-text block text-sm font-semibold">{label}</label><input id={`member-profile-${field}`} value={profile[field]} onChange={event => setProfile({ ...profile, [field]: event.target.value })} className="site-panel site-border site-text mt-2 min-h-11 w-full rounded-xl border px-3" /></div>)}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {['skills', 'interests', 'achievements'].map(field => <div key={field}><label htmlFor={`member-profile-${field}`} className="site-text block text-sm font-semibold">{field[0].toUpperCase() + field.slice(1)}<span className="site-muted block text-xs font-normal">One item per line</span></label><textarea id={`member-profile-${field}`} value={listValue(profile[field])} onChange={event => updateList(field, event.target.value)} className="site-panel site-border site-text mt-2 min-h-28 w-full rounded-xl border px-3 py-2" /></div>)}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {SOCIAL_FIELDS.map(field => <div key={field}><label htmlFor={`member-profile-${field}`} className="site-text block text-sm font-semibold">{field[0].toUpperCase() + field.slice(1)} URL</label><input id={`member-profile-${field}`} type="url" value={profile.socials?.[field] || ''} onChange={event => updateSocial(field, event.target.value)} className="site-panel site-border site-text mt-2 min-h-11 w-full rounded-xl border px-3" /></div>)}
                </div>
                <button type="submit" disabled={profileSaving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primaryDark disabled:opacity-70"><Save size={16} aria-hidden="true" />{profileSaving ? 'Saving...' : 'Save profile'}</button>
              </form>
            </section>

            <aside className="space-y-8">
              <section className="site-panel site-border rounded-2xl border p-6 shadow-sm" aria-labelledby="account-details-title"><h2 id="account-details-title" className="site-text text-xl font-bold">Account details</h2><dl className="mt-5 space-y-4"><div><dt className="site-muted text-xs font-bold uppercase tracking-wider">Username</dt><dd className="site-text mt-1 font-semibold">{account?.username}</dd></div><div><dt className="site-muted text-xs font-bold uppercase tracking-wider">Status</dt><dd className="site-accent mt-1 font-semibold">{account?.status}</dd></div></dl></section>
              <section className="site-panel site-border rounded-2xl border p-6 shadow-sm"><h2 className="site-text text-xl font-bold">Public profile</h2><p className="site-muted mt-2 text-sm leading-6">Visitors can see only approved public fields. QR codes point to the read-only profile and never authenticate this account.</p>{getStableMemberId(account?.profile) && <a href={`/members/${getStableMemberId(account.profile)}`} className="site-accent mt-5 inline-flex min-h-11 items-center font-semibold hover:underline">View public profile <span aria-hidden="true">→</span></a>}</section>
            </aside>
          </div>

          <section className="mt-10 space-y-8" aria-labelledby="certificates-title">
            <div><p className="site-accent text-xs font-bold uppercase tracking-[0.18em]">Private records by default</p><h2 id="certificates-title" className="site-text mt-3 text-3xl font-bold">Certificates</h2><p className="site-muted mt-2 max-w-2xl text-sm leading-7">Only certificates explicitly marked public can appear in the anonymous public certificate listing. Every upload, edit, visibility change, and deletion is checked against your account on the server.</p></div>
            <div className="grid gap-8 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
              <form onSubmit={uploadCertificate} className="site-panel site-border rounded-2xl border p-6 shadow-sm" aria-labelledby="certificate-upload-title"><div className="flex items-center gap-3"><Upload size={20} className="site-accent" aria-hidden="true" /><h3 id="certificate-upload-title" className="site-text text-xl font-bold">Add certificate</h3></div><div className="mt-5 space-y-4"><div><label htmlFor="certificate-title" className="site-text block text-sm font-semibold">Title</label><input id="certificate-title" value={certificateForm.title} onChange={event => setCertificateForm({ ...certificateForm, title: event.target.value })} className="site-panel site-border site-text mt-2 min-h-11 w-full rounded-xl border px-3" required /></div><div><label htmlFor="certificate-issuer" className="site-text block text-sm font-semibold">Issuer</label><input id="certificate-issuer" value={certificateForm.issuer} onChange={event => setCertificateForm({ ...certificateForm, issuer: event.target.value })} className="site-panel site-border site-text mt-2 min-h-11 w-full rounded-xl border px-3" /></div><div><label htmlFor="certificate-issued-at" className="site-text block text-sm font-semibold">Issue date</label><input id="certificate-issued-at" type="date" value={certificateForm.issuedAt} onChange={event => setCertificateForm({ ...certificateForm, issuedAt: event.target.value })} className="site-panel site-border site-text mt-2 min-h-11 w-full rounded-xl border px-3" /></div><div><label htmlFor="certificate-visibility" className="site-text block text-sm font-semibold">Visibility</label><select id="certificate-visibility" value={certificateForm.visibility} onChange={event => setCertificateForm({ ...certificateForm, visibility: event.target.value })} className="site-panel site-border site-text mt-2 min-h-11 w-full rounded-xl border px-3"><option value="private">Private</option><option value="public">Public</option></select></div><div><label htmlFor="certificate-file" className="site-text block text-sm font-semibold">File <span className="site-muted font-normal">PDF, JPG, PNG, or WebP up to 10 MB</span></label><input id="certificate-file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={event => setCertificateForm({ ...certificateForm, file: event.target.files?.[0] || null })} className="site-text mt-2 block w-full text-sm" required /></div><button type="submit" disabled={certificateSaving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primaryDark disabled:opacity-70"><FileText size={16} aria-hidden="true" />{certificateSaving ? 'Uploading...' : 'Upload certificate'}</button></div></form>
              <div className="space-y-4">{certificates.length === 0 ? <div className="site-panel site-border rounded-2xl border p-8 text-center"><p className="site-muted">You have no certificate records yet.</p></div> : certificates.map(certificate => <article key={certificate._id} className="site-panel site-border rounded-2xl border p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="site-text text-lg font-bold">{certificate.title}</h3><p className="site-muted mt-1 text-sm">{certificate.issuer || 'Issuer not provided'}{certificate.issuedAt ? ` · ${new Date(certificate.issuedAt).toLocaleDateString()}` : ''}</p></div><span className="site-accent text-xs font-bold uppercase tracking-wider">{certificate.visibility}</span></div><div className="mt-5 flex flex-wrap items-center gap-3"><select aria-label={`Visibility for ${certificate.title}`} value={certificate.visibility} onChange={event => changeVisibility(certificate, event.target.value)} className="site-panel site-border site-text min-h-10 rounded-lg border px-3 text-sm"><option value="private">Private</option><option value="public">Public</option></select>{certificate.downloadUrl && <a href={certificate.downloadUrl} target="_blank" rel="noopener noreferrer" className="site-accent inline-flex min-h-10 items-center gap-2 rounded-lg border site-border px-3 text-sm font-semibold hover:border-primary"><Check size={15} aria-hidden="true" /> Open file</a>}<button type="button" onClick={() => deleteCertificate(certificate)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-200 dark:hover:bg-red-950/40"><Trash2 size={15} aria-hidden="true" /> Delete</button></div></article>)}</div>
            </div>
          </section>
        </div>
      </main>
      <Footer sectionLinkPrefix="/" />
    </div>
  );
};

export default MemberDashboard;
