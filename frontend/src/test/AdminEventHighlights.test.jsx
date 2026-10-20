import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './dialog-support';
import AdminEventsNext from '../components/admin-next/AdminEventsNext';
import EventsManage from '../pages/admin/EventsManage';

vi.mock('../config', () => ({ default: '/api' }));

const photo = { url: 'https://example.invalid/existing.jpg', caption: 'Original photo' };
const original = { _id: '507f1f77bcf86cd799439011', title: 'Workshop', date: '2026-01-01', description: 'Session', image: 'cover.jpg', category: 'Workshop', time: '10:00', location: 'Auditorium', registrationLink: 'https://example.invalid/register', highlights: [photo] };
const other = { ...original, _id: '507f1f77bcf86cd799439012', title: 'Seminar', highlights: [] };
const jsonResponse = (body, status = 200) => ({ ok: status < 400, status, json: async () => structuredClone(body) });
let records;

beforeEach(() => {
  records = structuredClone([original, other]);
  localStorage.setItem('adminToken', 'test-token');
  // Stateful HTTP mock verifies reload behavior, without claiming a live database.
  vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
    if (url === '/api/events') return jsonResponse({ events: records, currentPage: 1, totalPages: 1 });
    if (url === '/api/admin/upload') return jsonResponse({ url: `https://example.invalid/${options.body.get('image').name}` });
    if (url === '/api/admin/events' && options.method === 'POST') {
      const record = { ...JSON.parse(options.body), _id: '507f1f77bcf86cd799439013' };
      records.push(record);
      return jsonResponse(record, 201);
    }
    const id = url.split('/').pop();
    if (options.method === 'PUT') {
      const record = records.find(item => item._id === id);
      Object.assign(record, JSON.parse(options.body));
      return jsonResponse(record);
    }
    if (options.method === 'DELETE') {
      records = records.filter(item => item._id !== id);
      return jsonResponse({ message: 'Event deleted' });
    }
    throw new Error(`Unexpected request: ${url}`);
  }));
});
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe.each([['Next', AdminEventsNext], ['Vite', EventsManage]])('%s admin galleries', (_, Component) => {
  const Page = Component;
  it('uploads multiple photos, reorders/captions/removes them, and saves the selected event across a reload', async () => {
    const user = userEvent.setup();
    const view = render(<Page />);
    await user.click(await screen.findByRole('button', { name: 'Edit Workshop' }));
    await user.upload(screen.getByLabelText('Add highlight photos'), [
      new File(['first'], 'first.jpg', { type: 'image/jpeg' }),
      new File(['second'], 'second.png', { type: 'image/png' }),
    ]);
    await screen.findByAltText('Highlight 3 preview');
    const uploads = fetch.mock.calls.filter(([url]) => url === '/api/admin/upload');
    expect(uploads).toHaveLength(2);
    for (const [, options] of uploads) {
      expect(options.method).toBe('POST');
      expect(new Headers(options.headers).get('Authorization')).toBe('Bearer test-token');
      expect(new Headers(options.headers).has('Content-Type')).toBe(false);
      expect([...options.body.keys()]).toEqual(['image']);
    }
    expect(records[0].highlights).toEqual([photo]); // Upload alone does not save the event.
    await user.click(screen.getByRole('button', { name: 'Remove photo 1' }));
    await user.click(screen.getByRole('button', { name: 'Move photo 2 earlier' }));
    expect(screen.getByLabelText('Caption for photo 1')).toHaveFocus();
    await user.type(screen.getByLabelText('Caption for photo 1'), 'Closing ceremony');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(records[0]).toMatchObject({ image: 'cover.jpg', time: original.time, location: original.location, registrationLink: original.registrationLink, highlights: [
      { url: 'https://example.invalid/second.png', caption: 'Closing ceremony' },
      { url: 'https://example.invalid/first.jpg', caption: '' },
    ] });
    expect(records[1]).toEqual(other);
    expect(fetch.mock.calls.find(([, options]) => options?.method === 'PUT')[0]).toBe(`/api/admin/events/${original._id}`);
    view.unmount();
    render(<Page />);
    await user.click(await screen.findByRole('button', { name: 'Edit Workshop' }));
    expect(screen.getByAltText('Highlight 1 preview')).toHaveAttribute('src', 'https://example.invalid/second.png');
    expect(screen.getByLabelText('Caption for photo 1')).toHaveValue('Closing ceremony');
    expect(screen.queryByAltText('Highlight 3 preview')).not.toBeInTheDocument();
  });

  it('persists clearing the last photo and creates a new event with highlights', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(await screen.findByRole('button', { name: 'Edit Workshop' }));
    await user.click(screen.getByRole('button', { name: 'Remove photo 1' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Edit Workshop' }));
    expect(screen.queryByAltText('Highlight 1 preview')).not.toBeInTheDocument();
    expect(records[0].highlights).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Close event form' }));
    await user.click(screen.getByRole('button', { name: /add event/i }));
    expect(screen.getByLabelText('Title')).toHaveValue('');
    await user.type(screen.getByLabelText('Title'), 'New event');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-12-01' } });
    await user.type(screen.getByLabelText('Description'), 'New session');
    await user.upload(screen.getByLabelText('Add highlight photos'), new File(['image'], 'new.jpg', { type: 'image/jpeg' }));
    await screen.findByAltText('Highlight 1 preview');
    await user.click(screen.getByRole('button', { name: 'Create Event' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(records[2].highlights).toEqual([{ url: 'https://example.invalid/new.jpg', caption: '' }]);
  });

  it('reports failed uploads and does not append or save failed photos', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(await screen.findByRole('button', { name: 'Edit Seminar' }));
    fetch.mockResolvedValueOnce(jsonResponse({ message: 'Upload service unavailable' }, 503));
    await user.upload(screen.getByLabelText('Add highlight photos'), new File(['image'], 'failed.jpg', { type: 'image/jpeg' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Upload service unavailable');
    expect(screen.queryByAltText('Highlight 1 preview')).not.toBeInTheDocument();
    expect(fetch.mock.calls.some(([, options]) => options?.method === 'PUT')).toBe(false);
  });

  it('keeps successful uploads in the draft when one file in a batch fails', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(await screen.findByRole('button', { name: 'Edit Seminar' }));
    fetch.mockResolvedValueOnce(jsonResponse({ message: 'First upload failed' }, 500))
      .mockResolvedValueOnce(jsonResponse({ url: 'https://example.invalid/good.jpg' }));
    await user.upload(screen.getByLabelText('Add highlight photos'), [
      new File(['bad'], 'bad.jpg', { type: 'image/jpeg' }),
      new File(['good'], 'good.jpg', { type: 'image/jpeg' }),
    ]);
    expect(await screen.findByRole('alert')).toHaveTextContent('First upload failed');
    expect(screen.getByAltText('Highlight 1 preview')).toHaveAttribute('src', 'https://example.invalid/good.jpg');
    expect(screen.queryByAltText('Highlight 2 preview')).not.toBeInTheDocument();
    expect(records[1].highlights).toEqual([]);
  });

  it('rejects a successful upload response without a usable URL', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(await screen.findByRole('button', { name: 'Edit Seminar' }));
    fetch.mockResolvedValueOnce(jsonResponse({}));
    await user.upload(screen.getByLabelText('Add highlight photos'), new File(['image'], 'file.jpg', { type: 'image/jpeg' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('valid photo URL');
    expect(screen.queryByAltText('Highlight 1 preview')).not.toBeInTheDocument();
  });

  it('blocks save during uploads and ignores upload completion after the editor is closed', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(await screen.findByRole('button', { name: 'Edit Workshop' }));
    let finish;
    fetch.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    await user.upload(screen.getByLabelText('Add highlight photos'), new File(['image'], 'slow.jpg', { type: 'image/jpeg' }));
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    const options = fetch.mock.calls.at(-1)[1];
    await user.click(screen.getByRole('button', { name: 'Close event form' }));
    expect(options.signal.aborted).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Edit Seminar' }));
    await act(async () => finish(jsonResponse({ url: 'https://example.invalid/slow.jpg' })));
    expect(screen.queryByAltText('Highlight 1 preview')).not.toBeInTheDocument();
  });

  it('keeps failed save feedback in the open event form and preserves deletion by _id', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(await screen.findByRole('button', { name: 'Edit Workshop' }));
    fetch.mockResolvedValueOnce(jsonResponse({ message: 'Save failed' }, 500));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent('Save failed');
    await user.click(screen.getByRole('button', { name: 'Close event form' }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Delete Workshop' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Edit Workshop' })).not.toBeInTheDocument());
    expect(records).toEqual([other]);
  });

  it('can edit a gallery beyond the first public API page', async () => {
    const user = userEvent.setup();
    const transport = fetch.getMockImplementation();
    fetch.mockImplementation((url, options) => {
      if (url === '/api/events') return Promise.resolve(jsonResponse({ events: [original], currentPage: 1, totalPages: 2 }));
      if (url === '/api/events?page=2') return Promise.resolve(jsonResponse({ events: [other], currentPage: 2, totalPages: 2 }));
      return transport(url, options);
    });
    render(<Page />);
    await user.click(await screen.findByRole('button', { name: 'Next page' }));
    await user.click(await screen.findByRole('button', { name: 'Edit Seminar' }));
    await user.upload(screen.getByLabelText('Add highlight photos'), new File(['image'], 'page-two.jpg', { type: 'image/jpeg' }));
    await screen.findByAltText('Highlight 1 preview');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(records[0]).toEqual(original);
    expect(records[1].highlights[0].url).toBe('https://example.invalid/page-two.jpg');
  });
});
