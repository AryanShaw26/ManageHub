import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4 sm:p-6 bg-canvas">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Mark */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center text-ink-900 shadow-warm-sm">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-ink-900">ManageHub</span>
          </Link>
          <p className="text-sm text-ink-500">Sign in to your institution workspace</p>
        </div>

        {/* Login Card */}
        <div className="rounded-bento bg-surface p-7 sm:p-8 border border-border shadow-warm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-ink-900">Sign in</h2>
            <p className="text-xs text-ink-500 mt-1">Enter your institutional credentials to proceed</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-danger text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@institution.edu"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              showPasswordToggle
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              icon={LogIn}
            >
              Sign in
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-ink-500 border-t border-border">
            <span>Need a new workspace for your school or college? </span>
            <Link to="/register" className="font-semibold text-ink-900 hover:text-brand-600 underline">
              Register institution
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
