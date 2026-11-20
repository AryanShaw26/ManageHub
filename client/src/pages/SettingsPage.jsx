import React, { useEffect, useState } from 'react';
import {
  Building,
  Users,
  Shield,
  Plus,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingSkeleton } from '../components/ui/EmptyState';

export const SettingsPage = () => {
  const { user, institution, refreshUser } = useAuth();

  // Institution Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [instSaving, setInstSaving] = useState(false);
  const [instMessage, setInstMessage] = useState(null);
  const [instError, setInstError] = useState(null);

  // Members list & invite modal
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteError, setInviteError] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [inviteSuccessNotice, setInviteSuccessNotice] = useState(null);

  const loadData = async () => {
    try {
      setLoadingMembers(true);
      const [instRes, memRes] = await Promise.all([
        api.get('/institution'),
        api.get('/users'),
      ]);

      if (instRes?.data?.institution) {
        const inst = instRes.data.institution;
        setName(inst.name || '');
        setEmail(inst.email || '');
        setPhone(inst.phone || '');
        setAddress(inst.address || '');
      }

      if (memRes?.data) {
        setMembers(memRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveInstitution = async (e) => {
    e.preventDefault();
    setInstError(null);
    setInstMessage(null);
    setInstSaving(true);

    try {
      await api.patch('/institution', {
        name,
        email,
        phone: phone || null,
        address: address || null,
      });
      setInstMessage('Institution profile details updated successfully.');
      await refreshUser();
      setTimeout(() => setInstMessage(null), 4000);
    } catch (err) {
      setInstError(err.message || 'Failed to update institution profile');
    } finally {
      setInstSaving(false);
    }
  };

  const handleInviteFaculty = async (e) => {
    e.preventDefault();
    setInviteError(null);
    setInviting(true);

    try {
      const res = await api.post('/users/faculty', {
        name: inviteName,
        email: inviteEmail,
        password: invitePassword,
      });

      setIsInviteModalOpen(false);
      setInviteSuccessNotice(
        `Faculty account created for ${inviteName} (${inviteEmail}). Provide them with their sign-in credentials.`
      );
      setTimeout(() => setInviteSuccessNotice(null), 6000);

      // Reset
      setInviteName('');
      setInviteEmail('');
      setInvitePassword('');

      await loadData();
    } catch (err) {
      setInviteError(err.message || 'Failed to register faculty account');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to change role');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Institution Settings</h1>
        <p className="text-sm text-ink-500">
          Manage workspace profile, contact information, and teaching staff roles.
        </p>
      </div>

      {instMessage && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-success text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{instMessage}</span>
        </div>
      )}

      {inviteSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-success text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{inviteSuccessNotice}</span>
        </div>
      )}

      {/* Grid: Institution Profile + Staff Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Institution Profile Form (5 cols) */}
        <div className="lg:col-span-5 bento-card space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Building className="w-5 h-5 text-brand-600" />
            <div>
              <h2 className="text-base font-bold text-ink-900">Institution Workspace</h2>
              <p className="text-xs text-ink-500">Official institutional identity</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-200 text-xs">
            <span className="font-semibold text-ink-700">Workspace Identifier Code:</span>
            <p className="font-mono font-bold text-ink-900 text-base mt-0.5">
              {institution?.institutionCode}
            </p>
            <p className="text-[11px] text-ink-500 mt-1">
              Guarantees isolated multi-tenant data boundaries.
            </p>
          </div>

          {instError && (
            <div className="p-3 rounded-xl bg-red-50 text-danger text-xs border border-red-200">
              {instError}
            </div>
          )}

          <form onSubmit={handleSaveInstitution} className="space-y-4">
            <Input
              label="Institution Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Official Contact Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0100"
            />
            <Input
              label="Campus Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 100 Innovation Parkway"
            />
            <Button type="submit" variant="primary" loading={instSaving} className="w-full">
              Save Institution Details
            </Button>
          </form>
        </div>

        {/* Right Column: Teaching Staff & Faculty Accounts (7 cols) */}
        <div className="lg:col-span-7 bento-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-brand-600" />
              <div>
                <h2 className="text-base font-bold text-ink-900">Teaching Staff & Faculty</h2>
                <p className="text-xs text-ink-500">
                  {members.length} registered institutional accounts
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => {
                setInviteError(null);
                setIsInviteModalOpen(true);
              }}
            >
              Add Faculty
            </Button>
          </div>

          {loadingMembers ? (
            <LoadingSkeleton count={4} />
          ) : (
            <div className="divide-y divide-border">
              {members.map((m) => (
                <div
                  key={m.userId}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink-900">{m.name}</span>
                      {m.userId === user?.id && (
                        <span className="text-[10px] bg-brand-100 text-ink-900 font-bold px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink-500">{m.email}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                      className="text-xs py-1 px-2.5 w-32"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="FACULTY">FACULTY</option>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Faculty Account Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Add Faculty Member"
        description="Creates a faculty account for your institution. Share credentials directly with the instructor."
      >
        <form onSubmit={handleInviteFaculty} className="space-y-4">
          {inviteError && (
            <div className="p-3 rounded-xl bg-red-50 text-danger text-xs border border-red-200">
              {inviteError}
            </div>
          )}

          <Input
            label="Faculty Full Name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="e.g. Prof. Alan Turing"
            required
          />

          <Input
            label="Sign-in Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="faculty@institution.edu"
            required
          />

          <Input
            label="Initial Password"
            type="password"
            value={invitePassword}
            onChange={(e) => setInvitePassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
            showPasswordToggle
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={inviting}>
              Create Faculty Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
