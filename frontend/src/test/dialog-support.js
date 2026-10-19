import { afterAll, beforeAll } from 'vitest';

// jsdom has no native dialog top layer. Browser focus containment/inertness still
// requires a real-browser check; these stubs only model the open/close methods.
const prototype = HTMLDialogElement.prototype;
const originalShow = Object.getOwnPropertyDescriptor(prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(prototype, 'close');

beforeAll(() => {
  Object.defineProperty(prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', ''); } });
  Object.defineProperty(prototype, 'close', { configurable: true, value() { this.removeAttribute('open'); } });
});

afterAll(() => {
  if (originalShow) Object.defineProperty(prototype, 'showModal', originalShow);
  else delete prototype.showModal;
  if (originalClose) Object.defineProperty(prototype, 'close', originalClose);
  else delete prototype.close;
});
