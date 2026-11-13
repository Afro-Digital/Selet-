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

  describe('Stage 8: Risk, Overhead & Scale Estimator (UI)', () => {
    it('navigates to Risk & Scale Estimator tab and displays all panels', () => {
      render(<Home />);
      const scaleTab = screen.getByRole('button', { name: /Risk & Scale/i });
      fireEvent.click(scaleTab);

      expect(screen.getByText('Full Project Cost Breakdown')).toBeDefined();
      expect(screen.getByText('Risk Multipliers & Uncertainty Factors')).toBeDefined();
      expect(screen.getByText('Scale Estimator')).toBeDefined();
    });

    it('entering 5,000 monthly users suggests infrastructure with visible assumptions and payer tags', () => {
      render(<Home />);
      const scaleTab = screen.getByRole('button', { name: /Risk & Scale/i });
      fireEvent.click(scaleTab);

      // Verify suggested items for 5,000 users & 500k payment volume
      expect(screen.getByText('AWS EC2 t4g.medium (2 vCPU, 4GB RAM)')).toBeDefined();
      expect(screen.getByText('Cloudflare Pro CDN & Web Application Firewall (WAF)')).toBeDefined();
      expect(screen.getByText('.et Country Code Domain (.et Registrar)')).toBeDefined();
      expect(
        screen.getByText('Telebirr & Chapa Payment Gateway Processing Fee (3.5%)'),
      ).toBeDefined();
      expect(screen.getByText('Sentry Performance Monitoring & Error Tracking')).toBeDefined();

      // Verify visible assumptions
      expect(
        screen.getByText(
          /Recommended for 1,000–10,000 monthly users \(current: 5,000\) with moderate database queries/i,
        ),
      ).toBeDefined();
      expect(
        screen.getByText(/Estimated 3\.5% transaction fee on monthly payment processing volume/i),
      ).toBeDefined();

      // Verify payer dropdown options
      const payerSelects = screen.getAllByRole('combobox');
      expect(payerSelects.length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Client \(Pass-Through\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Agency \(Internal\)/i).length).toBeGreaterThan(0);
    });

    it('updating scale inputs recalculates infrastructure suggestions and costs', () => {
      render(<Home />);
      const scaleTab = screen.getByRole('button', { name: /Risk & Scale/i });
      fireEvent.click(scaleTab);

      // Change users to 60,000
      const usersInput = screen.getByLabelText(/Monthly Active Users/i);
      fireEvent.change(usersInput, { target: { value: '60000' } });

      // Click recalculate suggestions
      const recalculateBtn = screen.getByRole('button', {
        name: /Suggest Infrastructure & Recurring Costs/i,
      });
      fireEvent.click(recalculateBtn);

      // Should now suggest Cluster setup
      expect(
        screen.getByText('Auto-scaling Container Cluster (ECS / Kubernetes + RDS Multi-AZ)'),
      ).toBeDefined();
      expect(
        screen.getByText(
          /Enterprise auto-scaling cluster with high concurrency handling for >50,000 monthly active users/i,
        ),
      ).toBeDefined();
    });

    it('toggling risk factors updates the total risk multiplier', () => {
      render(<Home />);
      const scaleTab = screen.getByRole('button', { name: /Risk & Scale/i });
      fireEvent.click(scaleTab);

      // Check initial total risk multiplier badge (23.0%)
      expect(screen.getByText('23.0%')).toBeDefined();

      // Toggle tight deadline factor (+5%)
      const tightDeadlineCheckbox = screen.getByLabelText(/Tight Deadline \/ Urgent Delivery/i);
      fireEvent.click(tightDeadlineCheckbox);

      // Total risk multiplier should now be 28.0% (10% contingency + 5% reqs + 8% tech + 5% deadline)
      expect(screen.getByText('28.0%')).toBeDefined();
    });

    it('Developer view redacts costs and rates in Project Cost Summary, Risk Manager, and Scale Estimator', () => {
      render(<Home />);
      // Switch simulated role to Developer
      const roleSelect = screen.getByRole('combobox');
      fireEvent.change(roleSelect, { target: { value: 'DEVELOPER' } });

      const scaleTab = screen.getByRole('button', { name: /Risk & Scale/i });
      fireEvent.click(scaleTab);

      // Check Developer privacy notices in Summary and Scale estimator
      expect(
        screen.getAllByText(/Financial costs and rate cards are hidden in Developer mode/i).length,
      ).toBeGreaterThan(0);

      // Recurring costs column shows Confidential (Hidden)
      expect(screen.getAllByText('Confidential (Hidden)').length).toBeGreaterThan(0);

      // Sliders & multiplier inputs should be disabled
      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThan(0);
      expect((sliders[0] as HTMLInputElement).disabled).toBe(true);
    });
  });

  describe('Stage 9: Pricing Scenarios, Margin Balancer & Commercial Floors (UI)', () => {
    it('navigates to Pricing tab and displays scenario cards, market baseline and balancer table', () => {
      render(<Home />);
      const pricingTab = screen.getByRole('button', { name: /Pricing & Margin/i });
      fireEvent.click(pricingTab);

      expect(screen.getAllByText('Pricing & Margin Balancer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Margin Balancer').length).toBeGreaterThan(0);
      expect(screen.getByText('Conservative / Low')).toBeDefined();
      expect(screen.getByText('Recommended')).toBeDefined();
      expect(screen.getByText('Stretch / High')).toBeDefined();
      expect(screen.getByText('Market Price Range')).toBeDefined();
      expect(screen.getByText('Module A (Core Features & API)')).toBeDefined();
      expect(screen.getByText('Module B (Storefront & Checkout)')).toBeDefined();
    });

    it('PRD Test: locks blended margin at 30%, lowers Module A from 25% to 20%, raises Module B', () => {
      render(<Home />);
      const pricingTab = screen.getByRole('button', { name: /Pricing & Margin/i });
      fireEvent.click(pricingTab);

      // Check initial Module A (25.0%) and Module B (35.0%)
      expect(screen.getByText('25.0%')).toBeDefined();
      expect(screen.getByText('35.0%')).toBeDefined();

      // Locate Module A margin slider
      const sliderA = screen.getByLabelText(/Module A .* Margin/i);
      // Lower Module A margin from 25% to 20%
      fireEvent.change(sliderA, { target: { value: '0.2' } });

      // Module A is now 20.0%
      expect(screen.getByText('20.0%')).toBeDefined();

      // Module B margin must automatically shift to 37.8%
      expect(screen.getByText('37.8%')).toBeDefined();

      // Blended margin remains locked at 30.0%
      expect(screen.getAllByText('30.0%').length).toBeGreaterThan(0);

      // Explanation callout confirms the shift
      expect(
        screen.getByText(
          /Adjusted Module A \(Core Features & API\) margin to 20\.0%\. Module B \(Storefront & Checkout\) margin shifted to 37\.8% to maintain 30\.0% blended margin/i,
        ),
      ).toBeDefined();
    });

    it('Target Price mode distributes client budget and calculates blended margin', () => {
      render(<Home />);
      const pricingTab = screen.getByRole('button', { name: /Pricing & Margin/i });
      fireEvent.click(pricingTab);

      // Switch to Target Price (Client Budget) tab
      const targetBudgetBtn = screen.getByRole('button', {
        name: /Target Price \(Client Budget\)/i,
      });
      fireEvent.click(targetBudgetBtn);

      // Enter client budget
      const budgetInput = screen.getByLabelText(/Client Fixed Budget/i);
      fireEvent.change(budgetInput, { target: { value: '6000' } });

      // Click calculate
      const calcBtn = screen.getByRole('button', { name: /Calculate Line Distribution/i });
      fireEvent.click(calcBtn);

      // Verify explanation shows distributed budget
      expect(
        screen.getByText(/Distributed client budget of 6,000 ETB proportionally across modules/i),
      ).toBeDefined();
    });

    it('What-If Discount mode applies discount and displays resulting margin', () => {
      render(<Home />);
      const pricingTab = screen.getByRole('button', { name: /Pricing & Margin/i });
      fireEvent.click(pricingTab);

      // Switch to What-If Discount tab
      const discountTabBtn = screen.getByRole('button', { name: /What-If Discount/i });
      fireEvent.click(discountTabBtn);

      // Click apply discount
      const applyBtn = screen.getByRole('button', { name: /Apply What-If Discount/i });
      fireEvent.click(applyBtn);

      // Verify explanation shows applied discount
      expect(screen.getByText(/Applied 10% discount to entire project/i)).toBeDefined();
    });

    it('Developer view redacts all margins, pricing scenarios, and profits', () => {
      render(<Home />);
      // Switch simulated role to Developer
      const roleSelect = screen.getByRole('combobox');
      fireEvent.change(roleSelect, { target: { value: 'DEVELOPER' } });

      const pricingTab = screen.getByRole('button', { name: /Pricing & Margin/i });
      fireEvent.click(pricingTab);

      // Check confidentiality notices
      expect(
        screen.getByText(
          /Financial margins, pricing scenarios, and profits are strictly hidden in Developer mode/i,
        ),
      ).toBeDefined();
      expect(
        screen.getByText(/Margin Balancer and financial levers are hidden in Developer mode/i),
      ).toBeDefined();

      // No price cards or profit totals rendered
      expect(screen.queryByText('Conservative / Low')).toBeNull();
      expect(screen.queryByText('Market Price Range')).toBeNull();
    });
  });

  describe('Stage 10: Quote Builder and PDF (UI)', () => {
    it('navigates to Quotes & PDF tab and displays quotes listing with immutable snapshot badges', () => {
      render(<Home />);
      const quotesTab = screen.getByRole('button', { name: /Quotes & PDF/i });
      fireEvent.click(quotesTab);

      // Verify Quote Builder header and sample quote
      expect(screen.getByText('Afro Digital Quote Builder')).toBeDefined();
      expect(screen.getByText('QT-2026-0001')).toBeDefined();
      expect(screen.getByText(/Ethiopian Airlines Enterprise/i)).toBeDefined();
      expect(screen.getByText(/1,380,000.00/i)).toBeDefined();
    });

    it('opens Afro Digital branded preview modal with deliverables, VAT 15%, and milestone schedule', () => {
      render(<Home />);
      const quotesTab = screen.getByRole('button', { name: /Quotes & PDF/i });
      fireEvent.click(quotesTab);

      // Click Preview Branded Quote
      const previewBtn = screen.getByRole('button', { name: /Preview Branded Quote/i });
      fireEvent.click(previewBtn);

      // Verify Modal Content
      expect(screen.getByRole('dialog', { name: /Quote Preview Modal/i })).toBeDefined();
      expect(screen.getByText('Afro Digital Technologies')).toBeDefined();
      expect(screen.getByText(/TIN: 0076543210/i)).toBeDefined();
      expect(screen.getAllByText(/Proclamation 1341\/2024/i).length).toBeGreaterThan(0);
      expect(screen.getByText('Payment Milestones Schedule')).toBeDefined();
      expect(screen.getByText('Project Kickoff & Advance Mobilization')).toBeDefined();

      // Close modal
      const closeBtn = screen.getByRole('button', { name: /Close Preview/i });
      fireEvent.click(closeBtn);
      expect(screen.queryByRole('dialog', { name: /Quote Preview Modal/i })).toBeNull();
    });

    it('creates quote form validates milestone percentages sum to 100%', () => {
      render(<Home />);
      const quotesTab = screen.getByRole('button', { name: /Quotes & PDF/i });
      fireEvent.click(quotesTab);

      // Click Create New Quote
      const createBtn = screen.getByRole('button', { name: /Create New Quote/i });
      fireEvent.click(createBtn);

      // Verify form elements
      expect(screen.getByText('Create New Commercial Quote')).toBeDefined();
      expect(screen.getByText(/Milestones total exactly 100.0%/i)).toBeDefined();

      // Switch to 50/50 preset
      const preset50Btn = screen.getByRole('button', { name: '50 / 50' });
      fireEvent.click(preset50Btn);
      expect(screen.getByDisplayValue('Advance Mobilization Deposit')).toBeDefined();
      expect(screen.getByDisplayValue('Final Delivery & Acceptance Sign-off')).toBeDefined();
      expect(screen.getByText(/Milestones total exactly 100.0%/i)).toBeDefined();

      // Test invalid milestone sum (change 50 to 30 -> total 80%)
      const percentageInputs = screen.getAllByRole('spinbutton', { name: /Milestone percentage for stage/i });
      fireEvent.change(percentageInputs[0]!, { target: { value: '30' } });
      expect(screen.getByText(/Milestone sum is 80.0%\. Must equal exactly 100%/i)).toBeDefined();

      // Save button should be disabled when invalid
      const saveBtn = screen.getByRole('button', { name: /Save Quote Draft/i });
      expect(saveBtn.hasAttribute('disabled')).toBe(true);
    });

    it('Developer view restricts access to commercial quotes and PDF export', () => {
      render(<Home />);
      // Switch simulated role to Developer
      const roleSelect = screen.getByRole('combobox');
      fireEvent.change(roleSelect, { target: { value: 'DEVELOPER' } });

      const quotesTab = screen.getByRole('button', { name: /Quotes & PDF/i });
      fireEvent.click(quotesTab);

      // Check confidentiality notice
      expect(screen.getByText('Access Restricted')).toBeDefined();
      expect(
        screen.getByText(
          /Quotes, commercial rates, statutory tax items, and PDF exports are accessible to Project Managers and Owners only/i,
        ),
      ).toBeDefined();

      // No quote records or create buttons rendered
      expect(screen.queryByText('QT-2026-0001')).toBeNull();
      expect(screen.queryByText('Create New Quote')).toBeNull();
    });
  });

  describe('Stage 11: Amharic and Ethiopian Calendar (UI & Conversion)', () => {
    it('renders calendar preference switcher and toggles between Ethiopian (ዓ.ም.) and Gregorian (G.C.)', () => {
      render(<Home />);
      const ethiopianCalBtn = screen.getByRole('button', { name: 'ዓ.ም.' });
      const gregorianCalBtn = screen.getByRole('button', { name: 'G.C.' });

      expect(ethiopianCalBtn).toBeDefined();
      expect(gregorianCalBtn).toBeDefined();

      fireEvent.click(gregorianCalBtn);
      fireEvent.click(ethiopianCalBtn);
    });

    it('creates an Amharic quote with Ethiopian calendar and displays Ge\'ez numerals and Ethiopian date in preview', () => {
      render(<Home />);
      const quotesTab = screen.getByRole('button', { name: /Quotes & PDF/i });
      fireEvent.click(quotesTab);

      // Click Create New Quote button
      const createBtn = screen.getByRole('button', { name: /Create New Quote/i });
      fireEvent.click(createBtn);

      // Verify Quote Language selector and Calendar selector exist
      const langSelect = screen.getByLabelText(/Quote Language/i);
      expect(langSelect).toBeDefined();
      fireEvent.change(langSelect, { target: { value: 'am' } });

      const calSelect = screen.getByLabelText(/Quote Calendar/i);
      expect(calSelect).toBeDefined();
      fireEvent.change(calSelect, { target: { value: 'ETHIOPIAN' } });

      // Title input
      const titleInput = screen.getByLabelText(/Quote Title/i);
      fireEvent.change(titleInput, { target: { value: 'የኢንተርፕራይዝ ሲስተም የዋጋ ማቅረቢያ' } });

      // Save quote draft
      const saveBtn = screen.getByRole('button', { name: /Save Quote Draft/i });
      fireEvent.click(saveBtn);

      // New quote card should appear with Amharic badge and Ethiopian calendar badge
      expect(screen.getByText('የኢንተርፕራይዝ ሲስተም የዋጋ ማቅረቢያ')).toBeDefined();
      expect(screen.getAllByText('አማርኛ').length).toBeGreaterThan(0);
      expect(screen.getAllByText('ዓ.ም. (E.C.)').length).toBeGreaterThan(0);

      // Open Preview Modal on the newly created quote
      const previewButtons = screen.getAllByRole('button', { name: /Preview/i });
      fireEvent.click(previewButtons[0]!);

      // Verify Amharic Formal Quote Title
      expect(screen.getByText('የአፍሮ ዲጂታል ኦፊሴላዊ የዋጋ ማቅረቢያ')).toBeDefined();
      expect(screen.getByText('ኦፊሴላዊ የዋጋ ማቅረቢያ')).toBeDefined();

      // Verify Ethiopian Calendar date indicator in preview
      expect(screen.getAllByText(/ዓ\.ም\./i).length).toBeGreaterThan(0);

      // Verify Birr currency in Amharic
      expect(screen.getAllByText(/ብር/i).length).toBeGreaterThan(0);

      // Verify Statutory Tax citation in Amharic (Proclamation 1341/2016)
      expect(screen.getByText(/የታክስ ህግ ተገዢነት ማረጋገጫ/i)).toBeDefined();
      expect(screen.getAllByText(/1341\/2016/i).length).toBeGreaterThan(0);
    });
  });
});
