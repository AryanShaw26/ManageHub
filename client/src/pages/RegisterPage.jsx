import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, AlertCircle, Building, User, Lock, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionEmail: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { registerInstitution } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);

    try {
      await registerInstitution(formData);
      navigate('/app');
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        const errors = {};
        err.details.forEach((d) => {
          errors[d.field || d.path] = d.message;
        });
        setFieldErrors(errors);
      }
      setError(err.message || 'Registration failed. Please review your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4 sm:p-6 bg-canvas py-10">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Mark */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center text-ink-900 shadow-warm-sm">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-ink-900">ManageHub</span>
          </Link>
          <p className="text-sm text-ink-500">Register your institution workspace</p>
        </div>

        {/* Register Card */}
        <div className="rounded-bento bg-surface p-7 sm:p-9 border border-border shadow-warm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink-900">Institution Registration</h2>
              <p className="text-xs text-ink-500 mt-1">
                Creates your isolated institutional workspace and first administrator account.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-danger text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-brand-50/80 border border-brand-200 flex items-start gap-2.5 text-xs text-ink-700">
            <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>
              Faculty accounts will be invited and created from your administrator settings once your workspace is set up.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="pt-2 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1.5 mb-3">
                <Building className="w-3.5 h-3.5" /> Institution Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Institution Name"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Institute of Technology"
                  required
                  error={fieldErrors.institutionName}
                />
                <Input
                  label="Institution Official Email"
                  name="institutionEmail"
                  type="email"
                  value={formData.institutionEmail}
                  onChange={handleChange}
                  placeholder="contact@institution.edu"
                  required
                  error={fieldErrors.institutionEmail}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1.5 mb-3">
                <User className="w-3.5 h-3.5" /> First Administrator Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Administrator Full Name"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Robert Vance"
                  required
                  error={fieldErrors.adminName}
                />
                <Input
                  label="Administrator Email (Login)"
                  name="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@institution.edu"
                  required
                  error={fieldErrors.adminEmail}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1.5 mb-3">
                <Lock className="w-3.5 h-3.5" /> Account Security
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  required
                  showPasswordToggle
                  error={fieldErrors.password}
                />
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  showPasswordToggle
                  error={fieldErrors.confirmPassword}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-4"
              icon={ArrowRight}
            >
              Complete Registration & Create Workspace
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-ink-500 border-t border-border">
            <span>Already have an account? </span>
            <Link to="/login" className="font-semibold text-ink-900 hover:text-brand-600 underline">
              Sign in to workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
