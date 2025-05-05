import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';

// Mock Supabase client needed by the component using jest
const mockSignIn = jest.fn();
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
    },
  }),
}));

// Mock shadcn/ui components used within LoginForm using jest
jest.mock('@/components/ui/button', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} />,
}));

// Input用のモックを作成 - React.forwardRefはmock内で直接使用できないので別の方法で記述
jest.mock('@/components/ui/input', () => ({
  Input: ({
    className,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) => (
    <input className={className} {...props} />
  ),
}));

// FormコンポーネントのモックはFormを実際のコンポーネントとして使用
jest.mock('@/components/ui/form', () => {
  return {
    Form: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    FormField: ({ render, name }: { render: (props: any) => React.ReactNode; name: string }) =>
      render({
        field: {
          name,
          value: '',
          onChange: jest.fn(),
          onBlur: jest.fn(),
        },
      }),
    FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
    FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    FormMessage: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    useFormField: () => ({
      id: 'test-id',
      name: 'test-name',
      formItemId: 'test-form-item-id',
      formDescriptionId: 'test-form-description-id',
      formMessageId: 'test-form-message-id',
      error: null,
    }),
  };
});

describe('LoginForm Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({ error: null }); // Default mock for successful login
  });

  it('renders email and password inputs and a submit button', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid inputs', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.click(submitButton);

    // Wait for async validation and state updates
    await waitFor(() => {
      // Check if specific error messages are displayed using getByText
      expect(screen.getByText(/有効なメールアドレスを入力してください。/i)).toBeInTheDocument();
      expect(screen.getByText(/パスワードは6文字以上である必要があります。/i)).toBeInTheDocument();
    });

    // Ensure submit callbacks were not called
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('calls signInWithPassword and onSuccess prop on successful submission', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  it('calls onError prop when signInWithPassword returns an error', async () => {
    const errorMessage = 'Invalid login credentials';
    mockSignIn.mockResolvedValue({ error: { message: errorMessage } });

    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
