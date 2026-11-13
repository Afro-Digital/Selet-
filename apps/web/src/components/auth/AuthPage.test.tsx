import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthPage } from './AuthPage';

describe('AuthPage & Onboarding Flow', () => {
  it('renders initial sign in screen with email, password, and no social logins', () => {
    render(<AuthPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Sign In' })).toBeDefined();
    expect(screen.getByPlaceholderText('architect@company.com')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sign In to Workspace' })).toBeDefined();

    // Verify social logins are completely removed
    expect(screen.queryByText(/Continue with Google/i)).toBeNull();
    expect(screen.queryByText(/Continue with GitHub/i)).toBeNull();
    expect(screen.queryByText(/Continue with Apple/i)).toBeNull();
  });

  it('switches between Sign In and Create Account modes', () => {
    render(<AuthPage />);

    const createAccountTab = screen.getByRole('tab', { name: 'Create Account' });
    fireEvent.click(createAccountTab);

    expect(screen.getByRole('heading', { level: 1, name: 'Create an Account' })).toBeDefined();
    expect(screen.getByPlaceholderText('Dawi Tadesse')).toBeDefined();
    expect(screen.getByPlaceholderText('architect@company.com')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Create Agency Account' })).toBeDefined();
  });

  it('submitting Sign In form logs in as OWNER and transitions to Onboarding Setup', () => {
    render(<AuthPage />);

    const emailInput = screen.getByPlaceholderText('architect@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(emailInput, { target: { value: 'director@afrodigital.et' } });
    fireEvent.change(passwordInput, { target: { value: 'supersecret123' } });

    const submitBtn = screen.getByRole('button', { name: 'Sign In to Workspace' });
    fireEvent.click(submitBtn);

    // Should transition to step 2: Organization Onboarding (Role: OWNER)
    expect(screen.getByText(/Organization Onboarding \(Role: OWNER\)/i)).toBeDefined();
    expect(screen.getByText('Configure Pricing & Profile')).toBeDefined();
    expect(screen.getByText('Save & Enter Workspace')).toBeDefined();
    expect(screen.getByText(/Skip for now/i)).toBeDefined();
  });

  it('submitting Create Account form creates account as OWNER and transitions to Onboarding Setup', () => {
    render(<AuthPage />);

    // Switch to register tab
    fireEvent.click(screen.getByRole('tab', { name: 'Create Account' }));

    const nameInput = screen.getByPlaceholderText('Dawi Tadesse');
    const emailInput = screen.getByPlaceholderText('architect@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(nameInput, { target: { value: 'Dawi Tadesse' } });
    fireEvent.change(emailInput, { target: { value: 'dawi@afrodigital.et' } });
    fireEvent.change(passwordInput, { target: { value: 'securepassword456' } });

    const submitBtn = screen.getByRole('button', { name: 'Create Agency Account' });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Organization Onboarding \(Role: OWNER\)/i)).toBeDefined();
  });
});
