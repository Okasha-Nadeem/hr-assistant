import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: 'hr' | 'applicant';
  name: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user: User | null = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return null; // Don't render header if no user is logged in
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              HR Portal
            </Link>
            <nav className="ml-10 flex space-x-8">
              {user.role === 'applicant' && (
                <>
                  <Link
                    to="/"
                    className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Jobs
                  </Link>
                 
                </>
              )}
              {user.role === 'hr' && (
                <Link
                  to="/hr"
                  className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  HR Dashboard
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
