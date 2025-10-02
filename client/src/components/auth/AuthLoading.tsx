import React from 'react';

interface AuthLoadingProps {
  message?: string;
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({ message = "Authenticating..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center page-container">
      <div className="text-center">
        {/* Spinning loader */}
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-200 mx-auto"></div>
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-purple-600 absolute inset-0 mx-auto"></div>
        </div>
        
        {/* Loading text */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-white mb-2">Please Wait</h2>
          <p className="text-purple-200 text-lg animate-pulse">{message}</p>
        </div>
        
        {/* Background animation */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};
