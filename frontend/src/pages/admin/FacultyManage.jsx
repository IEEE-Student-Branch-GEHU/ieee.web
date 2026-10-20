import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/button';
import API_BASE_URL from '../../config';
import { fetchJson } from '../../lib/http';
import MemberProfileActions from '../../components/admin/MemberProfileActions';
import MemberProfileFields from '../../components/admin/MemberProfileFields';
import { buildMemberPayload, createMemberForm } from '../../components/admin/memberProfile';

const FacultyManage = () => {
    const [team, setTeam] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState(() => createMemberForm(null, 'faculty'));
    const [uploading, setUploading] = useState(false);

    const fetchTeam = async () => {
        try {
            const data = await fetchJson(`${API_BASE_URL}/team`);
            if (Array.isArray(data)) {
                // Filter only faculty coordinators
                const faculty = data.filter(m => m.category === 'faculty');
                setTeam(faculty);
            }
        } catch (err) {
            console.error('Failed to fetch team:', err);
        }
    };

    // Start the async remote-state synchronization after the component mounts.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchTeam();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const form = new FormData();
        form.append('image', file);

        try {
            const data = await fetchJson(`${API_BASE_URL}/admin/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                body: form
            });
            setFormData(previous => ({ ...previous, image: data.url }));
        } catch {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingMember ? `${API_BASE_URL}/admin/team/${editingMember._id || editingMember.id}` : `${API_BASE_URL}/admin/team`;
        const method = editingMember ? 'PUT' : 'POST';

        // Ensure category is faculty
        const submissionData = buildMemberPayload(formData, { category: 'faculty' });

        try {
            await fetchJson(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(submissionData)
            });

            setIsModalOpen(false);
            setEditingMember(null);
            setFormData(createMemberForm(null, 'faculty'));
            fetchTeam();
        } catch (err) {
            alert(err.message || 'A networking error occurred.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coordinator?')) return;
        try {
            await fetchJson(`${API_BASE_URL}/admin/team/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            fetchTeam();
        } catch (err) {
            alert(err.message || 'Error deleting member.');
        }
    };

    const openEdit = (member) => {
        setEditingMember(member);
        setFormData(createMemberForm(member, 'faculty'));
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <GraduationCap size={24} />
                    </div>
                     <h2 className="admin-heading text-2xl font-bold">Faculty Coordinators</h2>
                </div>
                <Button onClick={() => { setEditingMember(null); setFormData(createMemberForm(null, 'faculty')); setIsModalOpen(true); }} className="flex gap-2 items-center bg-primary hover:bg-primaryDark text-white">
                    <Plus size={18} /> Add Coordinator
                </Button>
            </div>

             <div className="admin-table rounded-2xl shadow-sm border overflow-hidden text-sm">
                 <table className="w-full text-left border-collapse">
                     <thead className="admin-table-head text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Coordinator</th>
                            <th className="px-6 py-4 font-semibold">Role/Designation</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                     <tbody className="admin-table-body divide-y">
                        {team.length === 0 ? (
                            <tr>
                                     <td colSpan="3" className="admin-muted px-6 py-10 text-center italic">
                                    No faculty coordinators added yet.
                                </td>
                            </tr>
                        ) : team.map((member) => (
                             <tr key={member._id || member.id} className="admin-table-row transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {member.image ? (
                                            <img src={member.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold uppercase overflow-hidden">
                                                {member.name?.substring(0, 2)}
                                            </div>
                                        )}
                                         <span className="admin-table-primary font-medium">{member.name}</span>
                                    </div>
                                </td>
                                 <td className="admin-table-secondary px-6 py-4">{member.role}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <MemberProfileActions member={member} />
                                         <button type="button" aria-label={`Edit ${member.name}`} onClick={() => openEdit(member)} className="admin-icon-button p-2 rounded-lg transition-all">
                                            <Pencil size={18} />
                                        </button>
                                         <button type="button" aria-label={`Delete ${member.name}`} onClick={() => handleDelete(member._id || member.id)} className="admin-icon-button p-2 rounded-lg transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
                     <div className="admin-modal my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl animate-in zoom-in-95 duration-200">
                         <div className="admin-modal-header px-6 py-4 border-b flex justify-between items-center">
                             <h3 className="admin-heading font-bold">{editingMember ? 'Edit Coordinator' : 'Add New Coordinator'}</h3>
                             <button type="button" aria-label="Close coordinator form" onClick={() => setIsModalOpen(false)} className="admin-icon-button"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6">
                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                     <label htmlFor="faculty-member-name" className="admin-label block text-xs font-bold uppercase mb-1">Name</label>
                                    <input
                                        id="faculty-member-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                         className="admin-input w-full px-4 py-2 border rounded-xl outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                     <label htmlFor="faculty-member-role" className="admin-label block text-xs font-bold uppercase mb-1">Designation</label>
                                    <input
                                        id="faculty-member-role"
                                        placeholder="e.g. Assistant Professor"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                         className="admin-input w-full px-4 py-2 border rounded-xl outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <MemberProfileFields formData={formData} onChange={setFormData} idPrefix="faculty-member" />
                            <div>
                                 <label className="admin-label block text-xs font-bold uppercase mb-1">Photo</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                         <div className="admin-upload relative group overflow-hidden border border-dashed rounded-xl hover:border-primary transition-all">
                                            <input
                                                type="file"
                                                onChange={handleUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                             <div className="admin-muted py-2 flex items-center justify-center gap-2 group-hover:text-primary italic text-sm">
                                                <Upload size={16} /> {uploading ? 'Uploading...' : 'Click to upload'}
                                            </div>
                                        </div>
                                    </div>
                                    {formData.image && (
                                        <img src={formData.image} alt="Preview" className="w-12 h-12 rounded-full object-cover border shadow-sm" />
                                    )}
                                </div>
                            </div>
                            <Button type="submit" className="w-full py-3 bg-primary hover:bg-primaryDark text-white font-bold rounded-xl mt-4">
                                {editingMember ? 'Save Coordinator' : 'Add Coordinator'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyManage;
