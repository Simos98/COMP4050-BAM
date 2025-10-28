import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Devices from '../src/pages/Devices';

describe('Devices page', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <Devices />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});