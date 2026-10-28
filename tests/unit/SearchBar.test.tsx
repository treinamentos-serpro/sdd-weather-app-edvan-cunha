import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('does not call onSearch when the value is empty', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('calls onSearch with a trimmed value when a city is typed', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByLabelText(/buscar cidade/i);

    await user.type(input, '  São Paulo  ');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });

  it('normalizes repeated spaces before submitting special-character searches', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByLabelText(/buscar cidade/i);

    await user.type(input, '  São   Paulo &  região  ');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('São Paulo & região');
  });
});
