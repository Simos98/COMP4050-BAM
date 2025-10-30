import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Unauthorized from '../src/pages/Unauthorized';

describe('Unauthorized page', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});