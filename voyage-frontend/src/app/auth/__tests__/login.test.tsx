import { render, screen } from '@/lib/test-utils';
import LoginPage from '../login/page';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';

// Mock Next Auth
jest.mock('next-auth/react');
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('Login Page', () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null });
    const user = userEvent.setup();
    
    render(<LoginPage />);
    
    // Fill out the form
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password123',
      redirect: false,
    });
  });

  it('shows loading state during submission', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ ok: true, error: null }), 1000)
    ));
    
    const user = userEvent.setup();
    
    render(<LoginPage />);
    
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('displays error message on failed login', async () => {
    mockSignIn.mockResolvedValue({ 
      ok: false, 
      error: 'Invalid credentials' 
    });
    
    const user = userEvent.setup();
    
    render(<LoginPage />);
    
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('has link to registration page', () => {
    render(<LoginPage />);
    
    // Find the link in the bottom text that says "Don't have an account? Sign up"
    const registerText = screen.getByText(/don't have an account/i);
    const parentElement = registerText.parentElement;
    const registerLink = parentElement?.querySelector('a[href="/auth/register"]');
    
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    
    render(<LoginPage />);
    
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Form should not submit with invalid email
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});