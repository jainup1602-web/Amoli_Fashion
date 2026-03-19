'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser, logout } from '@/store/slices/authSlice';

export function AuthDebug() {
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const simulateLogin = () => {
    // Create a mock user and token for testing
    const mockUser = {
      _id: 'test-user-id',
      firebaseUid: 'test-firebase-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'customer' as const,
      addresses: []
    };
    
    // Create a mock JWT token
    const mockPayload = {
      user_id: 'test-firebase-uid',
      sub: 'test-firebase-uid',
      email: 'test@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify(mockPayload)).toString('base64');
    const signature = 'mock-signature';
    const mockToken = `${header}.${payload}.${signature}`;
    
    // Store token in localStorage
    localStorage.setItem('token', mockToken);
    
    // Update Redux state
    dispatch(setUser({ user: mockUser, token: mockToken }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="mb-2">
        <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
      </div>
      <div className="mb-2">
        <strong>User:</strong> {user ? user.displayName || user.email : 'None'}
      </div>
      <div className="mb-2">
        <strong>Token:</strong> {token ? 'Present' : 'None'}
      </div>
      <div className="mb-3">
        <strong>LocalStorage Token:</strong> {typeof window !== 'undefined' && localStorage.getItem('token') ? 'Present' : 'None'}
      </div>
      <div className="flex gap-2">
        {!isAuthenticated ? (
          <button 
            onClick={simulateLogin}
            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
          >
            Simulate Login
          </button>
        ) : (
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}