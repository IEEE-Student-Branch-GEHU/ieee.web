import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Reveal } from '../components/animations/Reveal';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  useInView: () => true,
  useAnimation: () => ({
    start: vi.fn(),
  }),
}));

describe('Reveal Component', () => {
  it('renders children correctly', () => {
    render(
      <Reveal>
        <div data-testid="test-child">Hello Reveal</div>
      </Reveal>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Hello Reveal')).toBeInTheDocument();
  });
});
