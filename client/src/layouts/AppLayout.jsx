import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  School,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';

export const AppLayout = () => {
  const { user, institution, role, isAdmin, isFaculty, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, exact: true },
    ...(isAdmin ? [{ label: 'Programs', to: '/app/programs', icon: BookOpen }] : []),
    { label: 'Classes', to: '/app/classes', icon: School },
    { label: 'Students', to: '/app/students', icon: Users },
    ...(isAdmin ? [{ label: 'Institution Settings', to: '/app/settings', icon: Settings }] : []),
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-900 flex">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface shrink-0 fixed inset-y-0 left-0 z-30">
        {/* Brand Area */}
        <div className="h-18 px-6 flex items-center gap-3 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-ink-900 shadow-warm-sm">
            <GraduationCap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-ink-900">ManageHub</span>
        </div>

        {/* Institution Badge */}
        <div className="px-5 py-4 border-b border-border bg-brand-50/40">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1">
            <Building className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </div>
          <div className="font-bold text-sm text-ink-900 truncate" title={institution?.name}>
            {institution?.name || 'Institution'}
          </div>
          <div className="text-[11px] font-mono text-ink-500 mt-0.5">
            Code: {institution?.institutionCode || '---'}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-100 text-ink-900 font-semibold shadow-warm-sm'
                    : 'text-ink-700 hover:text-ink-900 hover:bg-canvas'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-border bg-canvas/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-brand-200 text-ink-900 font-bold text-xs flex items-center justify-center shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-ink-900 truncate">{user?.name}</div>
                <div className="text-[11px] text-ink-500 truncate">{user?.email}</div>
              </div>
            </div>
            <Badge variant={isAdmin ? 'brand' : 'info'} size="sm">
              {role}
            </Badge>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-18 bg-surface/90 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl text-ink-700 hover:text-ink-900 hover:bg-canvas"
              aria-label="Open navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                {institution?.name}
              </span>
              <div className="text-sm font-bold text-ink-900">
                {location.pathname === '/app'
                  ? 'Dashboard Overview'
                  : location.pathname.startsWith('/app/programs')
                  ? 'Academic Programs'
                  : location.pathname.startsWith('/app/classes')
                  ? 'Classes & Batches'
                  : location.pathname.startsWith('/app/students')
                  ? 'Student Directory'
                  : 'Institution Settings'}
              </div>
            </div>
          </div>

          {/* User Status / Avatar */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-canvas transition-colors border border-transparent hover:border-border"
            >
              <div className="w-8 h-8 rounded-full bg-brand-200 text-ink-900 font-bold text-xs flex items-center justify-center shadow-sm">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-ink-900">{user?.name}</span>
                <span className="block text-[11px] text-ink-500">{role}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-ink-500" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-bento bg-surface p-2 shadow-warm-lg border border-border z-30"
                onClick={() => setUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs font-bold text-ink-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-ink-500 truncate">{user?.email}</p>
                  <div className="mt-1">
                    <Badge variant={isAdmin ? 'brand' : 'info'} size="sm">
                      Role: {role}
                    </Badge>
                  </div>
                </div>

                {isAdmin && (
                  <Link
                    to="/app/settings"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-700 hover:text-ink-900 hover:bg-canvas rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings & Staff</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Slide-Out Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative w-72 bg-surface h-full flex flex-col shadow-warm-lg z-10">
              <div className="h-18 px-5 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-ink-900">
                    <GraduationCap className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="font-bold text-ink-900">ManageHub</span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-xl text-ink-500 hover:text-ink-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-border bg-brand-50/40">
                <div className="text-xs font-bold text-ink-900">{institution?.name}</div>
                <div className="text-[11px] font-mono text-ink-500">Code: {institution?.institutionCode}</div>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-brand-100 text-ink-900 font-semibold'
                          : 'text-ink-700 hover:text-ink-900 hover:bg-canvas'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-danger hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
