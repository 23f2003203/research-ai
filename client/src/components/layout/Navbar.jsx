import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../ui/Button.jsx';
import { Sparkles, Menu, X, LogOut, PlusCircle, Compass, History, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-pastel-border/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pastel-peach via-pastel-rose to-pastel-lavender p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-white/90 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pastel-plum" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-pastel-plum font-sans">
              Research AI
            </span>
            <span className="text-[10px] uppercase tracking-wider text-pastel-muted font-medium">
              Autonomous Assistant
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'bg-pastel-pink/60 text-pastel-plum' : 'text-pastel-muted hover:text-pastel-plum hover:bg-white/60'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/research/new"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/research/new') ? 'bg-pastel-pink/60 text-pastel-plum' : 'text-pastel-muted hover:text-pastel-plum hover:bg-white/60'
                }`}
              >
                New Research
              </Link>
              <Link
                to="/history"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/history') ? 'bg-pastel-pink/60 text-pastel-plum' : 'text-pastel-muted hover:text-pastel-plum hover:bg-white/60'
                }`}
              >
                History
              </Link>
            </>
          ) : (
            <>
              <a
                href="/#features"
                className="px-3 py-2 rounded-xl text-sm font-medium text-pastel-muted hover:text-pastel-plum hover:bg-white/60 transition-colors"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="px-3 py-2 rounded-xl text-sm font-medium text-pastel-muted hover:text-pastel-plum hover:bg-white/60 transition-colors"
              >
                How It Works
              </a>
              <a
                href="/#example"
                className="px-3 py-2 rounded-xl text-sm font-medium text-pastel-muted hover:text-pastel-plum hover:bg-white/60 transition-colors"
              >
                Sample Report
              </a>
              <a
                href="/#faq"
                className="px-3 py-2 rounded-xl text-sm font-medium text-pastel-muted hover:text-pastel-plum hover:bg-white/60 transition-colors"
              >
                FAQ
              </a>
            </>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-pastel-plum bg-white/70 px-3 py-1.5 rounded-xl border border-pastel-border">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                title="Sign out"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-pastel-plum hover:bg-white/60 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-pastel-border px-4 pt-2 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-pastel-plum hover:bg-pastel-pink/50"
              >
                Dashboard
              </Link>
              <Link
                to="/research/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-pastel-plum hover:bg-pastel-pink/50"
              >
                New Research
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-pastel-plum hover:bg-pastel-pink/50"
              >
                History
              </Link>
              <div className="pt-2 border-t border-pastel-border flex items-center justify-between">
                <span className="text-xs text-pastel-muted font-medium">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-pastel-plum hover:bg-pastel-pink/50"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-pastel-plum hover:bg-pastel-pink/50"
              >
                How It Works
              </a>
              <div className="pt-3 border-t border-pastel-border flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-1/2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-1/2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Get Started
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
