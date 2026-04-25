'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = '' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setCurrentPage } = useAppStore();
  const { user: authUser, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Use auth user if available, fallback to app store user
  const currentUser = authUser || user;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className={`glass sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-2xl font-bold text-gradient animate-glow"
              onClick={() => handleNavClick('home')}
            >
              💍 Perfect Wedding
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavClick(item.name.toLowerCase())}
                  className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10"
                >
                  {item.name}
                </Link>
              ))}
              {currentUser ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => handleNavClick('dashboard')}
                    className="btn-primary text-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-2 text-sm text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => handleNavClick('login')}
                    className="text-sm text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => handleNavClick('signup')}
                    className="btn-primary text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              <motion.div
                animate={{ rotate: isMenuOpen ? 45 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavClick(item.name.toLowerCase())}
                  className="text-text-secondary hover:text-text-primary block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-white/10"
                >
                  {item.name}
                </Link>
              ))}
              {currentUser ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => handleNavClick('dashboard')}
                    className="btn-primary text-base mt-2 block text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-base text-text-secondary hover:text-text-primary block px-3 py-2 rounded-lg font-medium transition-colors hover:bg-white/10 mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => handleNavClick('login')}
                    className="text-text-secondary hover:text-text-primary block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => handleNavClick('signup')}
                    className="btn-primary text-base mt-2 block text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
