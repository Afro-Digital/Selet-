import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthPage } from './AuthPage';

describe('AuthPage & Onboarding Flow', () => {
  it('renders initial sign in screen with Selet branding and social auth buttons', () => {
    render(<AuthPage />);

    expect(screen.getByText('Sign In or Join Now!')).toBeDefined();
    expect(screen.getByText('Continue with Google')).toBeDefined();
    expect(screen.getByText('Continue with Apple')).toBeDefined();
    expect(screen.getByText('Continue with GitHub')).toBeDefined();
    expect(screen.getByText('Continue With Email')).toBeDefined();
  });

  it('clicking Continue with Google logs in as OWNER and transitions to Onboarding Setup', () => {
    render(<AuthPage />);

    const googleBtn = screen.getByText('Continue with Google');
    fireEvent.click(googleBtn);

    // Should transition to step 2: Organization Onboarding (Role: OWNER)
    expect(screen.getByText(/Organization Onboarding \(Role: OWNER\)/i)).toBeDefined();
    expect(screen.getByText('Configure Pricing & Profile')).toBeDefined();
    expect(screen.getByText('Save & Enter Workspace')).toBeDefined();
    expect(screen.getByText(/Skip for now/i)).toBeDefined();
  });

  it('submitting email transitions to Onboarding Setup', () => {
    render(<AuthPage />);

    const emailInput = screen.getByPlaceholderText('architect@company.com');
    fireEvent.change(emailInput, { target: { value: 'director@agency.et' } });

    const submitBtn = screen.getByText('Continue With Email');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Organization Onboarding \(Role: OWNER\)/i)).toBeDefined();
  });
});
