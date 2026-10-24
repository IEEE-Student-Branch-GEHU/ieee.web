'use client';

import { useCallback, useEffect, useState } from 'react';
import { GraduationCap, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '../ui/button';
import { adminFetchJson } from '../../lib/admin-api';
import { normalizeTeamResponse } from '../../lib/homepage-api';
import MemberProfileActions from '../admin/MemberProfileActions';
import MemberProfileFields from '../admin/MemberProfileFields';
import { buildMemberPayload, createMemberForm } from '../admin/memberProfile';
import MemberAccountProvisioning from '../admin/MemberAccountProvisioning';
import VolunteerGoogleAccess from '../admin/VolunteerGoogleAccess';
import { getStableMemberId } from '../../lib/public-site';

const AdminTeamNext = ({ facultyOnly = false }) => {
  const [team, setTeam] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState(() => createMemberForm(null, facultyOnly ? 'faculty' : 'executive'));
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTeam = useCallback(async () => {
    try {
      const data = await adminFetchJson('/team');
      const normalized = normalizeTeamResponse(data);
      setTeam(normalized.filter(member => facultyOnly ? member.category === 'faculty' : member.category !== 'faculty'));
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load team members.');
    }
  }, [facultyOnly]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchTeam(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchTeam]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const data = await adminFetchJson('/admin/upload', { method: 'POST', body: form });
      setFormData(previous => ({ ...previous, image: data.url }));
    } catch (error) {
      setErrorMessage(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const id = getStableMemberId(editingMember);
    if (editingMember && !id) {
      setErrorMessage('This member has no valid MongoDB profile ID and cannot be edited.');
      return;
    }
    const payload = buildMemberPayload(formData, { category: facultyOnly ? 'faculty' : formData.category });

    try {
      await adminFetchJson(id ? `/admin/team/${id}` : '/admin/team', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData(createMemberForm(null, facultyOnly ? 'faculty' : 'executive'));
      await fetchTeam();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save team member.');
    }
  };

  const handleDelete = async (id) => {
    const memberId = getStableMemberId(id);
    if (!memberId) {
      setErrorMessage('This member has no valid MongoDB profile ID and cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete this ${facultyOnly ? 'coordinator' : 'member'}?`)) return;
    try {
      await adminFetchJson(`/admin/team/${memberId}`, { method: 'DELETE' });
      await fetchTeam();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete team member.');
    }
  };

  const openCreate = () => { setEditingMember(null); setFormData(createMemberForm(null, facultyOnly ? 'faculty' : 'executive')); setIsModalOpen(true); };
  const openEdit = (member) => { setEditingMember(member); setFormData(createMemberForm(member, facultyOnly ? 'faculty' : member.category || 'executive')); setIsModalOpen(true); };
  const title = facultyOnly ? 'Faculty Coordinators' : 'Manage Team Members';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3">{facultyOnly && <div className="rounded-lg bg-purple-100 p-2 text-purple-600"><GraduationCap size={24} /></div>}<h2 className="text-2xl font-bold text-gray-800">{title}</h2></div><Button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white hover:bg-primaryDark"><Plus size={18} /> {facultyOnly ? 'Add Coordinator' : 'Add Member'}</Button></div>
       {errorMessage && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">{errorMessage}</p>}
       {!facultyOnly && <MemberAccountProvisioning members={team} />}
       {!facultyOnly && <VolunteerGoogleAccess members={team} />}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><table className="w-full border-collapse text-left"><thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-6 py-4 font-semibold">{facultyOnly ? 'Coordinator' : 'Member'}</th><th className="px-6 py-4 font-semibold">Role</th>{!facultyOnly && <th className="px-6 py-4 font-semibold">Category</th>}<th className="px-6 py-4 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{team.length === 0 ? <tr><td colSpan={facultyOnly ? 3 : 4} className="px-6 py-10 text-center italic text-gray-400">{facultyOnly ? 'No faculty coordinators added yet.' : 'No team members added yet.'}</td></tr> : team.map(member => <tr key={member._id || member.id} className="transition-colors hover:bg-gray-50"><td className="px-6 py-4"><div className="flex items-center gap-3">{member.image ? <img src={member.image} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 font-bold uppercase text-gray-400">{member.name?.substring(0, 2)}</div>}<span className="font-medium text-gray-900">{member.name}</span></div></td><td className="px-6 py-4 text-sm text-gray-600">{member.role}</td>{!facultyOnly && <td className="px-6 py-4 text-sm"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${member.category === 'faculty' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{member.category || 'executive'}</span></td>}<td className="px-6 py-4 text-right"><div className="flex flex-wrap justify-end gap-2"><MemberProfileActions member={member} /><button type="button" aria-label={`Edit ${member.name}`} onClick={() => openEdit(member)} className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-primary"><Pencil size={18} /></button><button type="button" aria-label={`Delete ${member.name}`} onClick={() => handleDelete(member._id || member.id)} className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"><Trash2 size={18} /></button></div></td></tr>)}</tbody></table></div>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"><div className="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex shrink-0 items-center justify-between border-b bg-gray-50 px-6 py-4"><h3 className="font-bold text-gray-800">{editingMember ? `Edit ${facultyOnly ? 'Coordinator' : 'Member'}` : `Add New ${facultyOnly ? 'Coordinator' : 'Member'}`}</h3><button type="button" aria-label="Close team form" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div><form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6"><div className="grid grid-cols-2 gap-4"><div><label htmlFor="member-name" className="mb-1 block text-xs font-bold uppercase text-gray-500">Name</label><input id="member-name" value={formData.name} onChange={event => setFormData({ ...formData, name: event.target.value })} className="w-full rounded-xl border bg-gray-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary" required /></div><div><label htmlFor="member-role" className="mb-1 block text-xs font-bold uppercase text-gray-500">{facultyOnly ? 'Designation' : 'Role'}</label><input id="member-role" value={formData.role} onChange={event => setFormData({ ...formData, role: event.target.value })} className="w-full rounded-xl border bg-gray-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary" required /></div></div>{!facultyOnly && <div><label htmlFor="member-category" className="mb-1 block text-xs font-bold uppercase text-gray-500">Category</label><select id="member-category" value={formData.category} onChange={event => setFormData({ ...formData, category: event.target.value })} className="w-full appearance-none rounded-xl border bg-gray-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"><option value="executive">Executive Team</option><option value="faculty">Faculty Coordinator</option></select></div>}<MemberProfileFields formData={formData} onChange={setFormData} idPrefix="member" /><div><span className="mb-1 block text-xs font-bold uppercase text-gray-500">Photo</span><div className="flex items-center gap-4"><label className="relative flex-1 cursor-pointer overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:border-primary"><input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 cursor-pointer opacity-0" /><span className="flex items-center justify-center gap-2 py-2 text-sm italic text-gray-500"><Upload size={16} /> {uploading ? 'Uploading...' : 'Click to upload'}</span></label>{formData.image && <img src={formData.image} alt="Preview" className="h-12 w-12 rounded-full border object-cover shadow-sm" />}</div></div><Button type="submit" className="mt-4 w-full rounded-xl bg-primary py-3 font-bold text-white hover:bg-primaryDark">{editingMember ? `Save ${facultyOnly ? 'Coordinator' : 'Member'}` : `Add ${facultyOnly ? 'Coordinator' : 'Member'}`}</Button></form></div></div>}
    </div>
  );
};

export default AdminTeamNext;
