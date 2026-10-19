import { useEffect, useState } from 'react';
import { KeyRound, UserPlus } from 'lucide-react';
import { adminFetchJson } from '../../lib/admin-api';
import { getStableMemberId } from '../../lib/public-site';

const MemberAccountProvisioning = ({ members = [] }) => {
  const [username, setUsername] = useState('');
  const [teamId, setTeamId] = useState('');
  const [activationToken, setActivationToken] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const selectableMembers = members.filter(member => getStableMemberId(member));

  useEffect(() => {
    if (!teamId && selectableMembers[0]) setTeamId(getStableMemberId(selectableMembers[0]));
  }, [selectableMembers, teamId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    setError('');
    setActivationToken('');
    try {
      const data = await adminFetchJson('/admin/members/provision', {
        method: 'POST',
        body: JSON.stringify({ username, teamId }),
      });
      setActivationToken(data.activationToken);
      setStatus('Account provisioned. Deliver this one-time activation secret through the approved member channel. It is shown only in this administrator session.');
      setUsername('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to provision member account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-panel rounded-2xl border p-6 shadow-sm" aria-labelledby="member-account-provisioning-title">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><UserPlus size={20} aria-hidden="true" /></div><div><h3 id="member-account-provisioning-title" className="admin-heading text-xl font-bold">Provision member access</h3><p className="admin-muted mt-1 text-sm leading-6">Link one approved Team profile to a member account. Public registration is disabled.</p></div></div>
      {selectableMembers.length === 0 ? <p className="admin-muted mt-5 text-sm">Create a Team profile with a valid MongoDB ID before provisioning an account.</p> : <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-[minmax(10rem,0.8fr)_minmax(14rem,1fr)_auto] md:items-end"><div><label htmlFor="member-account-username" className="admin-label mb-1 block text-xs font-bold uppercase">Username</label><input id="member-account-username" value={username} onChange={event => setUsername(event.target.value)} pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,63}" className="admin-input w-full rounded-xl border px-3 py-2" required /></div><div><label htmlFor="member-account-team" className="admin-label mb-1 block text-xs font-bold uppercase">Approved profile</label><select id="member-account-team" value={teamId} onChange={event => setTeamId(event.target.value)} className="admin-input w-full rounded-xl border px-3 py-2" required>{selectableMembers.map(member => { const memberId = getStableMemberId(member); return <option key={memberId} value={memberId}>{member.name} · {member.role}</option>; })}</select></div><button type="submit" disabled={saving} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primaryDark disabled:opacity-70"><KeyRound size={16} aria-hidden="true" />{saving ? 'Provisioning...' : 'Provision account'}</button></form>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      {status && <div role="status" className="admin-status-success mt-4 rounded-xl border p-4 text-sm"><p>{status}</p>{activationToken && <code className="admin-input mt-3 block overflow-x-auto rounded-lg border p-3 text-xs">{activationToken}</code>}</div>}
    </section>
  );
};

export default MemberAccountProvisioning;
