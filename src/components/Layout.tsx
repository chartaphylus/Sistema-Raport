import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, LogOut, Users, FileText, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Sistema Raport</h1>
                <p className="text-xs text-green-600 font-medium hidden sm:block">Pembagian Raport Digital</p>
              </div>
            </Link>
            
            <nav className="flex items-center space-x-1 sm:space-x-2">
              <Link
                to="/"
                className={`flex items-center px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive('/') 
                    ? 'bg-green-100 text-green-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Beranda</span>
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      isActive('/dashboard') 
                        ? 'bg-green-100 text-green-700 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all"
                  >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-2 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-xs sm:text-sm font-medium shadow-sm"
                >
                  <FileText className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="bg-white/60 backdrop-blur-sm border-t border-green-100 mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-gray-600 text-xs sm:text-sm px-4">
              © 2025 Sistema Raport. Sistem pembagian raport digital yang modern dan aman.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}