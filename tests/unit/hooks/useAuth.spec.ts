import { renderHook, act } from '@testing-library/react';

// Mock the Supabase client factory function
jest.mock('@/utils/supabase/client', () => {
  // Create mocks within the factory scope
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockSignOut = jest.fn();
  const mockGetSession = jest.fn();
  const mockUnsubscribe = jest.fn();
  const mockOnAuthStateChange = jest.fn().mockImplementation(() => ({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  }));

  // Return the mocked createClient function
  return {
    createClient: jest.fn().mockImplementation(() => ({
      auth: {
        signInWithPassword: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
      // Store mocks on the client instance for access in tests
      _mocks: {
        mockSignIn,
        mockSignUp,
        mockSignOut,
        mockGetSession,
        mockUnsubscribe,
        mockOnAuthStateChange,
      },
    })),
  };
});

// Import the hook AFTER mocks are defined and the module is mocked
import { useAuth } from '@/hooks/useAuth';
// Import the mocked client factory to access mocks
import { createClient } from '@/utils/supabase/client';

// Helper to get the latest mocks attached to the client instance
const getMocks = () => {
  const client = (createClient as jest.Mock)();
  return client._mocks;
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Reset mocks via the helper
    const mocks = getMocks();
    Object.values(mocks).forEach(mock => (mock as jest.Mock).mockClear());
    // Mock initial getSession call
    mocks.mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it('should initialize with no session and loading state', async () => {
    const { result } = renderHook(() => useAuth());
    const { mockGetSession, mockOnAuthStateChange } = getMocks();

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it('should call supabase.auth.signInWithPassword on signInWithPassword', async () => {
    const { result } = renderHook(() => useAuth());
    const { mockSignIn } = getMocks();
    const credentials = { email: 'test@example.com', password: 'password123' };

    await act(async () => {
      await result.current.signInWithPassword(credentials);
    });

    expect(mockSignIn).toHaveBeenCalledWith(credentials);
    expect(result.current.loading).toBe(false);
  });

  it('should call supabase.auth.signUp on signUp', async () => {
    const { result } = renderHook(() => useAuth());
    const { mockSignUp } = getMocks();
    const credentials = { email: 'new@example.com', password: 'newpassword' };

    await act(async () => {
      await result.current.signUp(credentials);
    });

    expect(mockSignUp).toHaveBeenCalledWith(credentials);
    expect(result.current.loading).toBe(false);
  });

  it('should call supabase.auth.signOut on signOut and clear session', async () => {
    const { mockGetSession, mockSignOut } = getMocks();
    const mockSession = { user: { id: '123', email: 'test@example.com' } } as any;
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });

    const { result } = renderHook(() => useAuth());

    await act(async () => {});
    expect(result.current.session).toEqual(mockSession);

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should update session state on auth state change', async () => {
    const { mockOnAuthStateChange } = getMocks();
    const { result } = renderHook(() => useAuth());
    const newSession = { user: { id: '456', email: 'changed@example.com' } } as any;

    await act(async () => {});

    // Get the actual callback function passed to onAuthStateChange
    // It's the first argument of the first call
    const authChangeCallback = mockOnAuthStateChange.mock.calls[0][0];

    // Check if the callback was captured correctly
    if (typeof authChangeCallback !== 'function') {
      throw new Error('Auth change callback was not captured or is not a function');
    }

    act(() => {
      authChangeCallback('SIGNED_IN', newSession);
    });

    expect(result.current.session).toEqual(newSession);
    expect(result.current.user).toEqual(newSession.user);
    expect(result.current.loading).toBe(false);
  });

  it('should call unsubscribe on unmount', async () => {
    const { mockUnsubscribe } = getMocks();
    const { unmount } = renderHook(() => useAuth());

    // Wait for initial setup
    await act(async () => {});

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
