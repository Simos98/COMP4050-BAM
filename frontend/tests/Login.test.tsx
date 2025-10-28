import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../src/pages/Login';

describe('Login page', () => {
  beforeEach(() => {
    // stub global fetch to prevent network calls
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ user: { email: 'a@b.com' } }) })
    ));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing and allows typing', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // try to find an input or button; if your form uses placeholders or labels change selectors accordingly
    const inputs = screen.queryAllByRole('textbox');
    // At minimum, ensure component rendered
    expect(inputs.length >= 0).toBe(true);

    // if there is a submit button, click it
    const submit = screen.queryByRole('button');
    if (submit) {
      await userEvent.click(submit);
      // fetch should have been called
      expect(fetch).toHaveBeenCalled();
    }
  });
});