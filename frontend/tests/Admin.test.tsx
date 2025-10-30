import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../src/pages/Admin';
import { vi } from 'vitest';

// Mock AuthContext used by Admin
vi.mock('../src/context/AuthContext', () => {
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAuth: () => ({
      user: { id: '1', email: 'admin@example.com', role: 'ADMIN' },
      login: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

describe('Admin page', () => {
  it('renders without crashing (smoke)', () => {
    const { container } = render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});