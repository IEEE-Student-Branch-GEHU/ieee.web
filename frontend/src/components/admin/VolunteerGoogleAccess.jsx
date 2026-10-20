import { useEffect, useState } from 'react';
import { MailCheck, Trash2 } from 'lucide-react';
import { adminFetchJson } from '../../lib/admin-api';
import { getStableMemberId } from '../../lib/public-site';

// Administrators authorize one Google account email per Team profile. Only
// these emails can use "Sign in with Google" as volunteers.
const VolunteerGoogleAccess = ({ members = [] }) => {
  const [authorized, setAuthorized] = useState([]);
  const [selectedTeamId, setTeamId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const selectableMembers = members.filter(member => getStableMemberId(member));
  const teamId = selectedTeamId || getStableMemberId(selectableMembers[0]) || '';
  const nameFor = id => {
    const member = selectableMembers.find(candidate => getStableMemberId(candidate) === id);
    return member ? `${member.name} · ${member.role}` : 'Removed profile';
  };

  const fetchAuthorized = () => Promise.resolve()
    .then(() => adminFetchJson('/admin/members/google'))
    .then(data => (Array.isArray(data) ? data : []));

  const loadAuthorized = async () => {
    try {
      setAuthorized(await fetchAuthorized());
    } catch (requestError) {
      setError(requestError.message || 'Unable to load volunteer Google access.');
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchAuthorized()
      .then((data) => { if (!cancelled) setAuthorized(data); })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message || 'Unable to load volunteer Google access.');
      });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    setError('');
    try {
      const data = await adminFetchJson(`/admin/members/${teamId}/google`, {
        method: 'PUT',
        body: JSON.stringify({ email }),
      });
      setStatus(`${data.email} can now sign in with Google as ${nameFor(teamId)}.`);
      setEmail('');
      await loadAuthorized();
    } catch (requestError) {
      setError(requestError.message || 'Unable to authorize volunteer email.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (entry) => {
    if (!window.confirm(`Remove Google sign-in for ${entry.email}?`)) return;
    setStatus('');
    setError('');
    try {
      await adminFetchJson(`/admin/members/${entry.teamId}/google`, { method: 'DELETE' });
      setStatus(`${entry.email} can no longer sign in with Google.`);
      await loadAuthorized();
    } catch (requestError) {
      setError(requestError.message || 'Unable to remove volunteer Google access.');
    }
  };

  return (
    <section className="admin-panel rounded-2xl border p-6 shadow-sm" aria-labelledby="volunteer-google-access-title">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><MailCheck size={20} aria-hidden="true" /></div><div><h3 id="volunteer-google-access-title" className="admin-heading text-xl font-bold">Volunteer Google sign-in</h3><p className="admin-muted mt-1 text-sm leading-6">Authorize a volunteer&apos;s Google account email for their Team profile. Only authorized emails can sign in with Google.</p></div></div>
      {selectableMembers.length === 0 ? <p className="admin-muted mt-5 text-sm">Create a Team profile before authorizing a volunteer email.</p> : <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-[minmax(14rem,1fr)_minmax(14rem,1fr)_auto] md:items-end"><div><label htmlFor="volunteer-google-team" className="admin-label mb-1 block text-xs font-bold uppercase">Team profile</label><select id="volunteer-google-team" value={teamId} onChange={event => setTeamId(event.target.value)} className="admin-input w-full rounded-xl border px-3 py-2" required>{selectableMembers.map(member => { const memberId = getStableMemberId(member); return <option key={memberId} value={memberId}>{member.name} · {member.role}</option>; })}</select></div><div><label htmlFor="volunteer-google-email" className="admin-label mb-1 block text-xs font-bold uppercase">Google account email</label><input id="volunteer-google-email" type="email" autoComplete="off" value={email} onChange={event => setEmail(event.target.value)} className="admin-input w-full rounded-xl border px-3 py-2" placeholder="volunteer@gmail.com" required /></div><button type="submit" disabled={saving} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primaryDark disabled:opacity-70"><MailCheck size={16} aria-hidden="true" />{saving ? 'Saving...' : 'Authorize email'}</button></form>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      {status && <p role="status" className="admin-status-success mt-4 rounded-xl border p-4 text-sm">{status}</p>}
      {authorized.length > 0 && (
        <ul className="mt-5 divide-y rounded-xl border" aria-label="Authorized volunteer emails">
          {authorized.map(entry => (
            <li key={entry.teamId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0"><p className="admin-heading font-semibold">{nameFor(entry.teamId)}</p><p className="admin-muted break-all">{entry.email}</p></div>
              <button type="button" onClick={() => handleRemove(entry)} aria-label={`Remove Google sign-in for ${entry.email}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 size={16} aria-hidden="true" />Remove</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default VolunteerGoogleAccess;
