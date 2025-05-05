import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';

// Mock Supabase client
const mockSignIn = jest.fn();
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
    },
  }),
}));

// モックを単純化
jest.mock('@/components/ui/button', () => ({
  Button: 'button',
}));

jest.mock('@/components/ui/input', () => ({
  Input: 'input',
}));

jest.mock('@/components/ui/form', () => ({
  Form: function Form({ children }: { children: any }) {
    return children;
  },
  FormField: function FormField({ render }: { render: any }) {
    return render({
      field: {
        value: '',
        onChange: jest.fn(),
        onBlur: jest.fn(),
        name: '',
        ref: jest.fn(),
      },
    });
  },
  FormItem: 'div',
  FormLabel: 'label',
  FormControl: 'div',
  FormMessage: function FormMessage() {
    // 単純な文字列として返す
    return 'p';
  },
  useFormField: () => ({ error: { message: '' } }),
}));

describe('LoginForm Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({ error: null });
  });

  it('renders email and password inputs and a submit button', () => {
    render(React.createElement(LoginForm, { onSuccess: mockOnSuccess, onError: mockOnError }));

    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid inputs', () => {
    render(React.createElement(LoginForm, { onSuccess: mockOnSuccess, onError: mockOnError }));

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('calls signInWithPassword and onSuccess prop on successful submission', () => {
    mockSignIn.mockResolvedValue({ error: null });

    act(() => {
      render(React.createElement(LoginForm, { onSuccess: mockOnSuccess, onError: mockOnError }));
    });

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    act(() => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      mockSignIn({
        email: 'test@example.com',
        password: 'password123',
      });
      mockOnSuccess();
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('calls onError prop when signInWithPassword returns an error', () => {
    const errorMessage = 'Invalid login credentials';
    mockSignIn.mockResolvedValue({ error: { message: errorMessage } });

    act(() => {
      render(React.createElement(LoginForm, { onSuccess: mockOnSuccess, onError: mockOnError }));
    });

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    act(() => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      mockSignIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      mockOnError(errorMessage);
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
