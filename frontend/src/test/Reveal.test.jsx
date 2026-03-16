import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Reveal from '../components/animations/Reveal';

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
