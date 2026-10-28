import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';

describe('UnitToggle', () => {
  it('marks the current unit as pressed', () => {
    render(<UnitToggle unit="celsius" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /°C/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /°F/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when a different unit is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /°F/i }));

    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });
});
