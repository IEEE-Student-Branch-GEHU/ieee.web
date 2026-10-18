'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const isOutside = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right
    || event.clientY < rect.top || event.clientY > rect.bottom;
};

// The native modal top layer provides focus containment and makes the rest of
// the document inert, including fixed navigation and carousel controls.
const Modal = ({ title, closeLabel, onClose, children, dark = false, dismissible = true, onKeyDown, className }) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const backdropStart = useRef(false);

  useEffect(() => {
    const trigger = document.activeElement;
    const dialog = dialogRef.current;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    closeRef.current.focus({ preventScroll: true });
    return () => {
      dialog.close();
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
       className={cn('m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-3xl border p-0 shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm',
         dark ? 'border-white/10 bg-primaryDark text-white' : 'site-modal', className)}
      onCancel={event => { event.preventDefault(); if (dismissible) onClose(); }}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          if (dismissible) onClose();
        } else onKeyDown?.(event);
      }}
      onPointerDown={event => { backdropStart.current = event.target === event.currentTarget && isOutside(event); }}
      onPointerCancel={() => { backdropStart.current = false; }}
      onClick={event => {
        if (dismissible && backdropStart.current && event.target === event.currentTarget && isOutside(event)) onClose();
        backdropStart.current = false;
      }}
    >
      <div className="min-w-0">
         <header className={cn('site-modal-header flex items-start justify-between gap-3 border-b p-4 sm:px-6', dark ? 'border-white/10' : '')}>
          <h2 id={titleId} className="min-w-0 self-center break-words font-bold" style={{ fontSize: 'clamp(1.125rem, 3vw, 1.5rem)' }}>{title}</h2>
          <button ref={closeRef} type="button" aria-label={closeLabel} disabled={!dismissible} onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-50">
            <X size={22} aria-hidden="true" />
          </button>
        </header>
        {children}
      </div>
    </dialog>, document.body,
  );
};

export default Modal;
