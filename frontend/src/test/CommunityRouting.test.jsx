import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../components/members/TeamsArchive', () => ({
  default: () => <div data-testid="community-directory">Community directory</div>,
}));
vi.mock('../pages/CommunityScanner', () => ({
  default: () => <div data-testid="community-scanner">Community scanner</div>,
}));

import App from '../App';

describe('community routing', () => {
  it('renders the complete directory at the canonical community route', () => {
    render(<MemoryRouter initialEntries={['/community']}><App /></MemoryRouter>);
    expect(screen.getByTestId('community-directory')).toBeInTheDocument();
  });

  it('redirects the legacy teams route to the canonical community route', () => {
    render(<MemoryRouter initialEntries={['/teams']}><App /></MemoryRouter>);
    expect(screen.getByTestId('community-directory')).toBeInTheDocument();
  });

  it('mounts the scanner at the community scanner route', () => {
    render(<MemoryRouter initialEntries={['/community/scan']}><App /></MemoryRouter>);
    expect(screen.getByTestId('community-scanner')).toBeInTheDocument();
  });
});
