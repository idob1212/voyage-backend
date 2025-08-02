import React from 'react';
import { render, screen } from '@/lib/test-utils';
import { ThemeToggleSimple } from '../theme-toggle';
import userEvent from '@testing-library/user-event';
import { useTheme } from 'next-themes';

// Mock the useTheme hook
jest.mock('next-themes');
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('ThemeToggleSimple Component', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    mockSetTheme.mockClear();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      systemTheme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
    });
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggleSimple />);
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('toggles from light to dark theme', async () => {
    const user = userEvent.setup();
    
    render(<ThemeToggleSimple />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    
    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('toggles from dark to light theme', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      systemTheme: 'dark',
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
    });

    const user = userEvent.setup();
    
    render(<ThemeToggleSimple />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    
    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('has proper accessibility attributes', () => {
    render(<ThemeToggleSimple />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toHaveClass('touch-friendly');
  });

  it('shows loading state before mount', () => {
    // Mock useState to simulate not mounted state
    const mockUseState = jest.spyOn(React, 'useState');
    mockUseState.mockImplementationOnce(() => [false, jest.fn()]);
    
    render(<ThemeToggleSimple />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });
});