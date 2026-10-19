'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import Modal from './ui/modal';
import { normalizeHighlights } from '../lib/event-highlights';

const HighlightPhoto = ({ photo, title, number }) => {
  const [state, setState] = useState('loading');
  return (
    <figure className="min-w-0">
      <div className="relative flex h-[55dvh] max-h-[36rem] min-h-32 items-center justify-center rounded-2xl bg-black/30">
        {state === 'loading' && <p role="status" className="absolute text-sm text-gray-300">Loading photo...</p>}
        {state === 'error' ? <p role="status" className="p-6 text-center text-gray-300">This photo could not be loaded.</p> : (
          <img src={photo.url} alt={`${title} — ${photo.caption || `highlight photo ${number}`}`}
            className="relative h-full w-full object-contain" onLoad={() => setState('loaded')} onError={() => setState('error')} />
        )}
      </div>
      {photo.caption && <figcaption className="mt-4 break-words text-center text-sm leading-relaxed text-gray-200">{photo.caption}</figcaption>}
    </figure>
  );
};

const EventHighlights = ({ event, onClose }) => {
  const photos = normalizeHighlights(event.highlights);
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const title = typeof event.title === 'string' && event.title ? event.title : 'Event';
  const changeSlide = direction => {
    if (photos.length > 1) setIndex(previous => (previous + direction + photos.length) % photos.length);
  };
  const handleKeyDown = keyEvent => {
    if (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.shiftKey
      || keyEvent.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(keyEvent.target.tagName)) return;
    if (keyEvent.key === 'ArrowLeft' || keyEvent.key === 'ArrowRight') {
      keyEvent.preventDefault();
      keyEvent.stopPropagation();
      changeSlide(keyEvent.key === 'ArrowRight' ? 1 : -1);
    }
  };
  const controlClass = 'flex h-12 min-w-12 items-center justify-center gap-1 rounded-xl border border-white/20 px-2 hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-40 sm:px-4';

  return (
    <Modal title={`${title} highlights`} closeLabel="Close highlights" dark onClose={onClose} onKeyDown={handleKeyDown} className="max-w-5xl">
      {photos.length === 0 ? (
        <p className="px-6 py-16 text-center text-gray-300">No highlights available for this event yet.</p>
      ) : (
        <div className="min-w-0 space-y-5 p-4 sm:p-6">
          <Motion.div key={index} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
            <HighlightPhoto photo={photos[index]} title={title} number={index + 1} />
          </Motion.div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <button type="button" aria-label="Previous photo" disabled={photos.length < 2} onClick={() => changeSlide(-1)} className={controlClass}>
              <ChevronLeft aria-hidden="true" size={22} /><span className="hidden sm:inline">Previous</span>
            </button>
            <p aria-live="polite" aria-atomic="true" className="min-w-0 text-center text-sm font-bold">Photo {index + 1} of {photos.length}</p>
            <button type="button" aria-label="Next photo" disabled={photos.length < 2} onClick={() => changeSlide(1)} className={controlClass}>
              <span className="hidden sm:inline">Next</span><ChevronRight aria-hidden="true" size={22} />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400">Use the arrow buttons or your keyboard to browse. Escape closes the gallery.</p>
        </div>
      )}
    </Modal>
  );
};

export default EventHighlights;
