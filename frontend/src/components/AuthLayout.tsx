import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-bold text-white mb-2">MovieApp</h1>
          </Link>
          <p className="text-gray-300">Your personal movie rating platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{title}</h2>
          
          {children}

          {/* Toggle between login/register */}
          <div className="mt-6 text-center">
            {isLogin ? (
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Log in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
