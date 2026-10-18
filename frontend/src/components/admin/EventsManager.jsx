'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { adminFetchJson } from '../../lib/admin-api';
import { normalizeEventsResponse } from '../../lib/homepage-api';
import EventEditor from './EventEditor';

// Shared by the two route adapters; no dependency on either router.
const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await adminFetchJson(page === 1 ? '/events' : `/events?page=${page}`);
      setEvents(normalizeEventsResponse(data));
      const lastPage = Math.max(1, data?.totalPages || 1);
      setTotalPages(lastPage);
      if (page > lastPage) setPage(lastPage);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSave = async (payload) => {
    const id = editingEvent?._id || editingEvent?.id;
    await adminFetchJson(id ? `/admin/events/${id}` : '/admin/events', {
      method: id ? 'PUT' : 'POST', body: JSON.stringify(payload),
    });
    setIsModalOpen(false);
    setEditingEvent(null);
    setNotice('Event and highlights saved.');
    await fetchEvents();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await adminFetchJson(`/admin/events/${id}`, { method: 'DELETE' });
      setNotice('Event deleted.');
      await fetchEvents();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete event.');
    }
  };

  const openEditor = (event = null) => {
    setNotice('');
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
         <h2 className="admin-heading text-2xl font-bold">Manage Events</h2>
        <Button onClick={() => openEditor()} className="flex items-center gap-2 bg-primary text-white hover:bg-primaryDark"><Plus size={18} /> Add Event</Button>
      </div>
       {errorMessage && <p role="alert" className="admin-status-error rounded-xl border p-4 text-sm font-bold">{errorMessage}</p>}
       {notice && <p role="status" className="admin-status-success text-sm font-bold">{notice}</p>}
       {loading && <p role="status" className="admin-muted text-sm">Loading events...</p>}
       <div className="admin-table overflow-x-auto rounded-2xl border shadow-sm">
         <table className="w-full border-collapse text-left">
           <thead className="admin-table-head text-xs uppercase tracking-wider">
            <tr><th className="px-6 py-4">Event</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Category</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
           <tbody className="admin-table-body divide-y">
             {!loading && events.length === 0 && <tr><td colSpan={4} className="admin-muted px-6 py-10 text-center">No events available.</td></tr>}
            {events.map(event => (
               <tr key={event._id || event.id} className="admin-table-row">
                <td className="px-6 py-4"><div className="flex items-center gap-3">
                  {event.image && <img src={event.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                   <span className="admin-table-primary font-medium">{event.title}</span>
                </div></td>
                 <td className="admin-table-secondary px-6 py-4 text-sm">{event.date}</td>
                <td className="px-6 py-4"><span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">{event.category}</span></td>
                <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2">
                   <button type="button" aria-label={`Edit ${event.title}`} onClick={() => openEditor(event)} className="admin-icon-button rounded-lg p-3 focus-visible:outline-2 focus-visible:outline-primary"><Pencil size={18} /></button>
                   <button type="button" aria-label={`Delete ${event.title}`} onClick={() => handleDelete(event._id || event.id)} className="admin-icon-button rounded-lg p-3 focus-visible:outline-2 focus-visible:outline-primary"><Trash2 size={18} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <nav aria-label="Admin event pagination" className="flex flex-wrap items-center justify-center gap-3">
        <Button disabled={loading || page === 1} onClick={() => setPage(previous => previous - 1)}>Previous page</Button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <Button disabled={loading || page === totalPages} onClick={() => setPage(previous => previous + 1)}>Next page</Button>
      </nav>}
      {isModalOpen && <EventEditor key={editingEvent?._id || editingEvent?.id || 'new'} event={editingEvent} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default EventsManager;
