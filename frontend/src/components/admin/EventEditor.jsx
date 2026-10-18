'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import Modal from '../ui/modal';
import { adminFetchJson } from '../../lib/admin-api';
import { isHighlightUrl, MAX_CAPTION_LENGTH, MAX_HIGHLIGHTS, normalizeHighlights } from '../../lib/event-highlights';

const initialForm = (event) => {
  const form = { title: '', date: '', description: '', image: '', category: 'Technical' };
  for (const field of ['title', 'date', 'description', 'image', 'category', 'time', 'location', 'registrationLink']) {
    if (typeof event?.[field] === 'string') form[field] = event[field];
  }
  return { ...form, highlights: normalizeHighlights(event?.highlights) };
};

const inputClass = 'admin-input w-full min-w-0 rounded-xl border px-4 py-2 outline-none';
const photoButtonClass = 'admin-photo-button flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40';

const EventEditor = ({ event, onSave, onClose }) => {
  const [form, setForm] = useState(() => initialForm(event));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const requestRef = useRef(null);
  const busyRef = useRef(false);
  const focusAfterChange = useRef(null);
  const busy = uploading || saving;

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    if (focusAfterChange.current) {
      document.getElementById(focusAfterChange.current)?.focus();
      focusAfterChange.current = null;
    }
  }, [form.highlights]);

  const uploadPhotos = async (inputEvent, cover = false) => {
    const files = Array.from(inputEvent.target.files || []);
    inputEvent.target.value = '';
    if (!files.length || busyRef.current) return;
    setError('');
    setStatus('');
    if (!cover && form.highlights.length + files.length > MAX_HIGHLIGHTS) {
      setError(`An event can have at most ${MAX_HIGHLIGHTS} highlight photos. Remove photos or select fewer files.`);
      return;
    }
    busyRef.current = true;
    setUploading(true);
    const controller = new AbortController();
    requestRef.current = controller;
    const failures = [];
    let uploaded = 0;

    // The existing upload route accepts one image per request. Preserve order
    // and retain successful draft uploads if another file in the batch fails.
    for (const [index, file] of files.entries()) {
      if (controller.signal.aborted) return;
      setStatus(`Uploading ${cover ? 'cover image' : `highlight ${index + 1} of ${files.length}`}...`);
      try {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
          && !(file.type === '' && /\.(jpe?g|png|webp)$/i.test(file.name))) {
          throw new Error('Choose a JPG, PNG or WebP image.');
        }
        const body = new FormData();
        body.append('image', file);
        const data = await adminFetchJson('/admin/upload', { method: 'POST', body, signal: controller.signal });
        if (controller.signal.aborted) return;
        if (!isHighlightUrl(data?.url)) throw new Error('The upload did not return a valid photo URL.');
        setForm(previous => cover
          ? { ...previous, image: data.url }
          : { ...previous, highlights: [...previous.highlights, { url: data.url, caption: '' }] });
        uploaded += 1;
      } catch (uploadError) {
        if (controller.signal.aborted) return;
        failures.push(`${file.name}: ${uploadError.message || 'Upload failed. Please try again.'}`);
        if (uploadError.name === 'AdminUnauthorizedError') break;
      }
    }
    setError(failures.join(' '));
    setStatus(`${uploaded} photo${uploaded === 1 ? '' : 's'} uploaded to this draft. Save the event to publish changes.`);
    setUploading(false);
    busyRef.current = false;
  };

  const movePhoto = (index, direction) => {
    focusAfterChange.current = `highlight-caption-${index + direction}`;
    setForm(previous => {
      const highlights = [...previous.highlights];
      const target = index + direction;
      if (target < 0 || target >= highlights.length) return previous;
      [highlights[index], highlights[target]] = [highlights[target], highlights[index]];
      return { ...previous, highlights };
    });
  };

  const removePhoto = (index) => {
    const remaining = form.highlights.filter((_, i) => i !== index);
    focusAfterChange.current = remaining.length
      ? `highlight-caption-${Math.min(index, remaining.length - 1)}` : 'event-highlights';
    setForm(previous => ({ ...previous, highlights: remaining }));
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (saveError) {
      setError(saveError.message || 'The event could not be saved. Please try again.');
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal title={event ? 'Edit Event' : 'Add New Event'} closeLabel="Close event form" onClose={onClose} dismissible={!saving} className="admin-dialog">
      <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
        {error && <p role="alert" className="admin-status-error break-words rounded-xl border p-3 text-sm">{error}</p>}
        <p role="status" className="admin-status-success text-sm">{saving ? 'Saving event...' : status}</p>
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <div>
            <label htmlFor="event-title" className="mb-1 block text-sm font-bold">Title</label>
            <input id="event-title" className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="event-date" className="mb-1 block text-sm font-bold">Date</label>
              <input id="event-date" type="date" className={inputClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="min-w-0">
              <label htmlFor="event-category" className="mb-1 block text-sm font-bold">Category</label>
              <select id="event-category" className={inputClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {[...new Set(['Technical', 'Non-Technical', 'Workshop', 'Networking', form.category])].map(category => <option key={category}>{category}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="event-description" className="mb-1 block text-sm font-bold">Description</label>
            <textarea id="event-description" rows={3} className={inputClass} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="event-cover" className="block text-sm font-bold">Cover image</label>
            <input id="event-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => uploadPhotos(e, true)} className={`${inputClass} text-sm`} />
            {form.image && <img src={form.image} alt="Event cover preview" className="h-24 w-32 rounded-xl border object-contain" />}
          </div>
          <section aria-labelledby="event-highlights-heading" className="admin-profile-section min-w-0 space-y-4 border-t pt-5">
            <h3 id="event-highlights-heading" className="font-bold" style={{ fontSize: '1.125rem' }}>Event highlights</h3>
            <p id="event-highlights-help" className="admin-table-secondary text-sm leading-relaxed">
              Up to {MAX_HIGHLIGHTS} photos, separate from the cover. Additions, removals, captions and order are published only when you save the event.
            </p>
            <div>
              <label htmlFor="event-highlights" className="mb-2 block text-sm font-bold">Add highlight photos</label>
              <input id="event-highlights" type="file" multiple accept="image/jpeg,image/png,image/webp" aria-describedby="event-highlights-help" onChange={e => uploadPhotos(e)} className={`${inputClass} text-sm`} />
            </div>
            {form.highlights.length === 0 && <p className="admin-muted text-sm">No highlight photos added yet.</p>}
            <ol className="space-y-4">
              {form.highlights.map((photo, index) => (
                <li key={`${photo.url}-${index}`} className="admin-dialog-item min-w-0 space-y-3 rounded-2xl border p-3">
                  <img src={photo.url} alt={`Highlight ${index + 1} preview`} className="h-40 w-full rounded-xl bg-gray-50 object-contain" />
                  <div>
                    <label htmlFor={`highlight-caption-${index}`} className="mb-1 block text-sm font-medium">Caption for photo {index + 1}</label>
                    <input id={`highlight-caption-${index}`} maxLength={MAX_CAPTION_LENGTH} value={photo.caption} placeholder="Optional caption" className={inputClass}
                      onChange={e => setForm(previous => ({ ...previous, highlights: previous.highlights.map((item, i) => i === index ? { ...item, caption: e.target.value } : item) }))} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" className={photoButtonClass} aria-label={`Move photo ${index + 1} earlier`} disabled={index === 0} onClick={() => movePhoto(index, -1)}><ArrowUp size={18} aria-hidden="true" /></button>
                    <button type="button" className={photoButtonClass} aria-label={`Move photo ${index + 1} later`} disabled={index === form.highlights.length - 1} onClick={() => movePhoto(index, 1)}><ArrowDown size={18} aria-hidden="true" /></button>
                    <button type="button" className={`${photoButtonClass} gap-2 text-red-700`} aria-label={`Remove photo ${index + 1}`}
                      onClick={() => removePhoto(index)}>
                      <Trash2 size={18} aria-hidden="true" /> Remove
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </fieldset>
        <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl bg-primary font-bold text-white hover:bg-primaryDark focus-visible:ring-primary">
          {event ? 'Save Changes' : 'Create Event'}
        </Button>
      </form>
    </Modal>
  );
};

export default EventEditor;
