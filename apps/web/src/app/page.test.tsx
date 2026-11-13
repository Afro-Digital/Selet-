import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Stage 6: Cost Catalog, Currency Service & Notifications (UI)', () => {
  it('renders the header with app name and branding', () => {
    render(<Home />);
    expect(screen.getByText(/Selet \(ስሌት\)/i)).toBeDefined();
    expect(screen.getAllByText('Team Members').length).toBeGreaterThan(0);
  });

  it('Owner view shows computed hourly costs and financial columns', () => {
    render(<Home />);
    expect(screen.getByText('Basic Salary')).toBeDefined();
    expect(screen.getByText('Pension (POESSA 11%)')).toBeDefined();
    expect(screen.getByText('Total Monthly Cost')).toBeDefined();
    expect(screen.getAllByText('Hourly Cost').length).toBeGreaterThan(0);
    expect(screen.getByText('Dagmawi Tesfaye')).toBeDefined();
  });

  it('Developer view strips and redacts sensitive salary and cost columns', () => {
    render(<Home />);
    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'DEVELOPER' } });

    expect(
      screen.getByText(/Salary, overhead, and hourly costs are strictly redacted/i),
    ).toBeDefined();
    expect(screen.queryByText('Basic Salary')).toBeNull();
    expect(screen.queryByText('Pension (POESSA 11%)')).toBeNull();
    expect(screen.queryByText('Total Monthly Cost')).toBeNull();

    expect(screen.getByText('Dagmawi Tesfaye')).toBeDefined();
    expect(screen.getAllByText('Lead Architect / Backend Lead').length).toBeGreaterThan(0);
  });

  it('Notification Bell opens popover and displays stale price / tax notifications', () => {
    render(<Home />);
    const bellBtn = screen.getByLabelText('Notifications');
    fireEvent.click(bellBtn);

    expect(screen.getByText(/Stale Price: DigitalOcean Basic Droplet/i)).toBeDefined();
    expect(screen.getByText(/Unverified Tax Rule: Digital Services Tax/i)).toBeDefined();
  });

  it('navigates to Cost Catalog tab and displays cloud infrastructure items and stale flags', () => {
    render(<Home />);
    const catalogTab = screen.getByRole('button', { name: /Cost Catalog/i });
    fireEvent.click(catalogTab);

    expect(
      screen.getByText(
        'Pass-through infrastructure, licenses, and tooling costs with stale price tracking.',
      ),
    ).toBeDefined();
    expect(screen.getByText('[Example] AWS EC2 t4g.medium')).toBeDefined();
    expect(screen.getByText('[Example] DigitalOcean Basic Droplet (2GB)')).toBeDefined();
    expect(screen.getAllByText(/Stale/i).length).toBeGreaterThan(0);
  });

  it('navigates to Currency Service tab and allows setting manual rate override', () => {
    render(<Home />);
    const currencyTab = screen.getByRole('button', { name: /Currency & Exchange Rates/i });
    fireEvent.click(currencyTab);

    expect(screen.getByText(/1 USD/i)).toBeDefined();
    expect(screen.getAllByText(/128.50 ETB/i).length).toBeGreaterThan(0);

    // Click Override button on USD
    const overrideButtons = screen.getAllByRole('button', { name: /Override/i });
    expect(overrideButtons[0]).toBeDefined();
    fireEvent.click(overrideButtons[0]!);

    // Modal appears
    expect(screen.getByText(/Override USD\/ETB Rate/i)).toBeDefined();
  });

  it('switches language between English and Amharic for Cost Catalog and Currency', () => {
    render(<Home />);
    const amharicBtn = screen.getByRole('button', { name: 'አማርኛ' });
    fireEvent.click(amharicBtn);

    expect(screen.getAllByText('የወጪ ካታሎግ (እቃዎችና አገልግሎቶች)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('የምንዛሬ ተመን እና ልውውጥ').length).toBeGreaterThan(0);

    const enBtn = screen.getByRole('button', { name: 'EN' });
    fireEvent.click(enBtn);
    expect(screen.getAllByText('Cost Catalog').length).toBeGreaterThan(0);
  });

  describe('Stage 7: Estimate Builder, WBS Hierarchy & Multi-Method Estimation (UI)', () => {
    it('navigates to Estimates tab and displays Estimate Builder & WBS summary bar', () => {
      render(<Home />);
      const estimatesTab = screen.getByRole('button', { name: /Estimates/i });
      fireEvent.click(estimatesTab);

      expect(screen.getByText('Estimate Builder')).toBeDefined();
      expect(screen.getByText('Work Breakdown Structure (WBS)')).toBeDefined();
      expect(screen.getByText('Total Project Hours')).toBeDefined();
      expect(screen.getByText('Storefront & Product Catalog')).toBeDefined();
    });

    it('Owner view shows live estimated labor costs in WBS summary bar', () => {
      render(<Home />);
      const estimatesTab = screen.getByRole('button', { name: /Estimates/i });
      fireEvent.click(estimatesTab);

      expect(screen.getByText('Estimated Labor Cost')).toBeDefined();
      expect(screen.getAllByText(/ETB/i).length).toBeGreaterThan(0);
    });

    it('opens Starter Templates modal and loads a template', () => {
      render(<Home />);
      const estimatesTab = screen.getByRole('button', { name: /Estimates/i });
      fireEvent.click(estimatesTab);

      // Click Starter Templates button
      const templatesBtn = screen.getByRole('button', { name: /Starter Templates/i });
      fireEvent.click(templatesBtn);

      // Verify modal content
      expect(screen.getByText(/Example hours provided for reference/i)).toBeDefined();
      expect(screen.getByText('B2B SaaS Application')).toBeDefined();

      // Click Load Template for B2B SaaS
      const loadButtons = screen.getAllByRole('button', { name: /Load Starter Template/i });
      expect(loadButtons.length).toBeGreaterThan(0);
      fireEvent.click(loadButtons[1]!); // Second template is SaaS

      // Verify template project loaded
      expect(screen.getByText(/B2B SaaS Application \(Copy\)/i)).toBeDefined();
    });

    it('switches estimation method on a feature and updates hours', () => {
      render(<Home />);
      const estimatesTab = screen.getByRole('button', { name: /Estimates/i });
      fireEvent.click(estimatesTab);

      // Locate method select dropdown
      const methodSelects = screen.getAllByLabelText('Estimation Method');
      expect(methodSelects.length).toBeGreaterThan(0);

      // Switch first feature method to T-Shirt Size
      fireEvent.change(methodSelects[0]!, { target: { value: 'T_SHIRT' } });
      expect(screen.getAllByText(/T-Shirt Sizing/i).length).toBeGreaterThan(0);
    });

    it('Developer view hides financial labor costs and enforces assignment restrictions', () => {
      render(<Home />);
      // Switch simulated role to Developer
      const roleSelect = screen.getByRole('combobox');
      fireEvent.change(roleSelect, { target: { value: 'DEVELOPER' } });

      const estimatesTab = screen.getByRole('button', { name: /Estimates/i });
      fireEvent.click(estimatesTab);

      // Verify cost is hidden
      expect(screen.queryByText('Estimated Labor Cost')).toBeNull();
      expect(
        screen.getByText(/Financial costs and rate cards are hidden in Developer mode/i),
      ).toBeDefined();

      // Verify assignment restriction notice is displayed for unassigned / non-Dawit features
      expect(
        screen.getAllByText(/Developers can only enter hours for tasks assigned to them/i).length,
      ).toBeGreaterThan(0);
    });
  });
});
