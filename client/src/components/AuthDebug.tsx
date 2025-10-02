import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading, token } = useAuth();

  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? '✅' : '❌'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {user ? `${user.email} (${user.role})` : 'None'}</div>
        <div>Token in State: {token ? '✅' : '❌'}</div>
        <div>Token in Storage: {storedToken ? '✅' : '❌'}</div>
        <div>User in Storage: {storedUser ? '✅' : '❌'}</div>
        {storedUser && (
          <div>Stored User: {JSON.parse(storedUser).email}</div>
        )}
      </div>
    </div>
  );
};
