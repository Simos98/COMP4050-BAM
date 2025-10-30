import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Bookings from '../src/pages/Bookings';

describe('Bookings page', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});