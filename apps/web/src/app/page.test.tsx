import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Stage 5: People & Rate Cards Dashboard (UI)', () => {
  it('renders the header with app name and branding', () => {
    render(<Home />);
    expect(screen.getByText(/Selet \(ስሌት\)/i)).toBeDefined();
    expect(screen.getAllByText('Team Members').length).toBeGreaterThan(0);
  });

  it('Owner view shows computed hourly costs and financial columns', () => {
    render(<Home />);
    // Owner is default
    expect(screen.getByText('Basic Salary')).toBeDefined();
    expect(screen.getByText('Pension (POESSA 11%)')).toBeDefined();
    expect(screen.getByText('Total Monthly Cost')).toBeDefined();
    expect(screen.getAllByText('Hourly Cost').length).toBeGreaterThan(0);

    // Abebe / Dagmawi team member should be visible
    expect(screen.getByText('Dagmawi Tesfaye')).toBeDefined();
  });

  it('Developer view strips and redacts sensitive salary and cost columns', () => {
    render(<Home />);
    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'DEVELOPER' } });

    // Developer should see redacted notice
    expect(
      screen.getByText(/Salary, overhead, and hourly costs are strictly redacted/i),
    ).toBeDefined();

    // Financial headers must NOT be present
    expect(screen.queryByText('Basic Salary')).toBeNull();
    expect(screen.queryByText('Pension (POESSA 11%)')).toBeNull();
    expect(screen.queryByText('Total Monthly Cost')).toBeNull();

    // Dagmawi's name and role should still be visible
    expect(screen.getByText('Dagmawi Tesfaye')).toBeDefined();
    expect(screen.getAllByText('Lead Architect / Backend Lead').length).toBeGreaterThan(0);
  });

  it('switches language between English and Amharic', () => {
    render(<Home />);
    const amharicBtn = screen.getByRole('button', { name: 'አማርኛ' });
    fireEvent.click(amharicBtn);

    // Header in Amharic
    expect(screen.getAllByText('የቡድን አባላት').length).toBeGreaterThan(0);
    expect(screen.getAllByText('የሥራ መደቦች').length).toBeGreaterThan(0);
    expect(screen.getAllByText('የክፍያ ተመን ካርዶች').length).toBeGreaterThan(0);

    // Switch back to English
    const enBtn = screen.getByRole('button', { name: 'EN' });
    fireEvent.click(enBtn);
    expect(screen.getAllByText('Team Members').length).toBeGreaterThan(0);
  });

  it('navigates between Team Members, Job Roles, and Rate Cards tabs', () => {
    render(<Home />);

    // Click Job Roles tab
    const rolesTab = screen.getByRole('button', { name: /Job Roles/i });
    fireEvent.click(rolesTab);
    expect(
      screen.getByText('Standardized job roles used for project estimations and rate cards.'),
    ).toBeDefined();
    expect(screen.getByText('Senior Frontend Engineer')).toBeDefined();

    // Click Rate Cards tab
    const rateCardsTab = screen.getByRole('button', { name: /Rate Cards/i });
    fireEvent.click(rateCardsTab);
    expect(
      screen.getAllByText(/Standard Agency Rate Card 2026 \(Domestic\)/i).length,
    ).toBeGreaterThan(0);
  });
});
