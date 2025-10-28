import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingDetails from '../src/pages/BookingDetails';

describe('BookingDetails page', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <BookingDetails />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});