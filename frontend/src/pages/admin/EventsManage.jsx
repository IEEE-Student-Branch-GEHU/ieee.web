import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';

const EventsManage = () => {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({ title: '', date: '', description: '', image: '', category: 'Technical' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const form = new FormData();
        form.append('image', file);

        try {
            const res = await fetch('/api/admin/upload', {
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
        const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events';
        const method = editingEvent ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingEvent(null);
                setFormData({ title: '', date: '', description: '', image: '', category: 'Technical' });
                fetchEvents();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.message || 'Failed to save event.'}`);
            }
        } catch (err) {
            alert('A networking error occurred. Please check your connection.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) {
                fetchEvents();
            } else {
                alert('Failed to delete event.');
            }
        } catch (err) {
            alert('Networking error occurred.');
        }
    };

    const openEdit = (event) => {
        setEditingEvent(event);
        setFormData(event);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Manage Events</h2>
                <Button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="flex gap-2 items-center bg-primary hover:bg-primaryDark text-white">
                    <Plus size={18} /> Add Event
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Event</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Category</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {events.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {event.image && (
                                            <img src={event.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                        )}
                                        <span className="font-medium text-gray-900">{event.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{event.date}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold uppercase">
                                        {event.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEdit(event)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
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
                            <h3 className="font-bold text-gray-800">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option>Technical</option>
                                        <option>Non-Technical</option>
                                        <option>Workshop</option>
                                        <option>Networking</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image</label>
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
                                        <img src={formData.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover border shadow-sm" />
                                    )}
                                </div>
                            </div>
                            <Button type="submit" className="w-full py-3 bg-primary hover:bg-primaryDark text-white font-bold rounded-xl mt-4">
                                {editingEvent ? 'Save Changes' : 'Create Event'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventsManage;
