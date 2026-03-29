import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/button';
import API_BASE_URL from '../../config';

const FacultyManage = () => {
    const [team, setTeam] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({ name: '', role: '', bio: '', image: '', linkedin: '', instagram: '', category: 'faculty' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/team`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Filter only faculty coordinators
                const faculty = data.filter(m => m.category === 'faculty');
                setTeam(faculty);
            }
        } catch (err) {
            console.error('Failed to fetch team:', err);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const form = new FormData();
        form.append('image', file);

        try {
            const res = await fetch(`${API_BASE_URL}/admin/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                body: form
            });
            const data = await res.json();
            if (res.ok) setFormData({ ...formData, image: data.url });
        } catch (err) {
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
        const submissionData = { ...formData, category: 'faculty' };

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(submissionData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingMember(null);
                setFormData({ name: '', role: '', bio: '', image: '', linkedin: '', instagram: '', category: 'faculty' });
                fetchTeam();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.message || 'Failed to save member.'}`);
            }
        } catch (err) {
            alert('A networking error occurred.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coordinator?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/team/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) {
                fetchTeam();
            } else {
                alert('Failed to delete.');
            }
        } catch (err) {
            alert('Error deleting member.');
        }
    };

    const openEdit = (member) => {
        setEditingMember(member);
        setFormData(member);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <GraduationCap size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Faculty Coordinators</h2>
                </div>
                <Button onClick={() => { setEditingMember(null); setIsModalOpen(true); }} className="flex gap-2 items-center bg-primary hover:bg-primaryDark text-white">
                    <Plus size={18} /> Add Coordinator
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Coordinator</th>
                            <th className="px-6 py-4 font-semibold">Role/Designation</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {team.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">
                                    No faculty coordinators added yet.
                                </td>
                            </tr>
                        ) : team.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {member.image ? (
                                            <img src={member.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold uppercase overflow-hidden">
                                                {member.name.substring(0, 2)}
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-900">{member.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{member.role}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEdit(member)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(member.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">{editingMember ? 'Edit Coordinator' : 'Add New Coordinator'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Designation</label>
                                    <input
                                        placeholder="e.g. Assistant Professor"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none h-20 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Photo</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="relative group overflow-hidden bg-gray-50 border border-dashed border-gray-300 rounded-xl hover:border-primary transition-all">
                                            <input
                                                type="file"
                                                onChange={handleUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <div className="py-2 flex items-center justify-center gap-2 text-gray-500 group-hover:text-primary italic text-sm">
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
