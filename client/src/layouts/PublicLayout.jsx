import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-900">
      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-ink-900 shadow-warm-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-ink-900">ManageHub</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-700">
            <a href="/#features" className="hover:text-ink-900 transition-colors">Features</a>
            <a href="/#preview" className="hover:text-ink-900 transition-colors">Product Preview</a>
            <a href="/#how-it-works" className="hover:text-ink-900 transition-colors">How It Works</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-ink-700 hover:text-ink-900 hover:bg-canvas"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-4 py-5 space-y-4">
            <nav className="flex flex-col gap-3 font-medium text-ink-700">
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-ink-900"
              >
                Features
              </a>
              <a
                href="/#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-ink-900"
              >
                Product Preview
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-ink-900"
              >
                How It Works
              </a>
            </nav>
            <div className="pt-3 border-t border-border flex flex-col gap-2.5">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-ink-900">
              <GraduationCap className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="font-bold text-ink-900">ManageHub</span>
              <p className="text-xs text-ink-500">Student records and semester-wise academic workspace.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-ink-500">
            <Link to="/login" className="hover:text-ink-900">Log in</Link>
            <Link to="/register" className="hover:text-ink-900">Register Institution</Link>
          </div>

          <div className="text-xs text-ink-500">
            &copy; {new Date().getFullYear()} ManageHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
