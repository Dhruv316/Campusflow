import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Camera, Lock } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

import { updateProfile, changePassword } from '../../api/users.api.js';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../api/axios.js';
import { getErrorMessage } from '../../utils/helpers.js';
import useAuth from '../../hooks/useAuth.js';

const profileSchema = z.object({
  name:       z.string().min(2, 'At least 2 characters').max(100),
  phone:      z.string().optional().refine((v) => !v || /^[+\d\s\-]{7,20}$/.test(v), 'Invalid phone number'),
  department: z.string().max(100).optional(),
  year:       z.string().optional(),
  avatar:     z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs uppercase').regex(/[0-9]/, 'Needs a number'),
  confirmPassword: z.string().min(1, 'Please confirm'),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const YEAR_OPTIONS = [
  { value: '1', label: '1st Year' }, { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' }, { value: '4', label: '4th Year' },
  { value: '5', label: '5th Year' },
];

const Profile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuth();

  const { register: regProfile, handleSubmit: handleProfile, reset: resetProfile, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '', department: '', year: '', avatar: '' },
  });

  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name ?? '', phone: user.phone ?? '', department: user.department ?? '', year: user.year ? String(user.year) : '', avatar: user.avatar ?? '' });
    }
  }, [user, resetProfile]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => { toast.success('Profile updated!'); setUser(res?.data?.user ?? user); queryClient.invalidateQueries({ queryKey: ['me'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwdErrors } } = useForm({ resolver: zodResolver(passwordSchema) });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (res) => {
      const { accessToken, refreshToken } = res?.data ?? {};
      if (accessToken)  localStorage.setItem(ACCESS_TOKEN_KEY,  accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      toast.success('Password changed! Other devices have been signed out.');
      resetPwd();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSaveProfile = (data) => {
    const payload = { ...data };
    if (!payload.avatar) delete payload.avatar;
    profileMutation.mutate(payload);
  };

  if (!user) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl">
        {/* Avatar panel */}
        <div className="lg:col-span-1">
          <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4">
            <div className="relative">
              <Avatar name={user.name} src={user.avatar || undefined} size="xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-lime flex items-center justify-center shadow-lime cursor-pointer" title="Change avatar URL in profile form">
                <Camera className="w-4 h-4 text-ink" />
              </div>
            </div>
            <div>
              <p className="text-display text-2xl text-white tracking-[2px]">{user.name?.toUpperCase()}</p>
              <p className="text-sm text-muted mt-0.5">{user.email}</p>
            </div>
            <Badge variant={user.role === 'ADMIN' ? 'warning' : 'info'}>{user.role}</Badge>
            {user.rollNumber && (
              <p className="text-xs font-mono font-bold text-lime bg-raised px-3 py-1.5 rounded-lg border border-border">{user.rollNumber}</p>
            )}
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile form */}
          <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-6">
            <h2 className="text-display text-xl text-white tracking-[2px] mb-5 border-b border-raised pb-3">PERSONAL INFORMATION</h2>
            <form onSubmit={handleProfile(onSaveProfile)} noValidate className="space-y-4">
              <Input label="Full Name" name="name" register={regProfile} error={profileErrors.name?.message} required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary">Email</label>
                  <div className="px-4 py-2.5 rounded-lg bg-raised border border-border text-muted text-sm cursor-not-allowed">{user.email}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary">Roll Number</label>
                  <div className="px-4 py-2.5 rounded-lg bg-raised border border-border text-muted text-sm font-mono cursor-not-allowed">{user.rollNumber ?? '—'}</div>
                  <p className="text-xs text-muted">Cannot be changed</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Phone" name="phone" type="tel" placeholder="+91 9876543210" register={regProfile} error={profileErrors.phone?.message} />
                <Select label="Academic Year" name="year" options={YEAR_OPTIONS} register={regProfile} error={profileErrors.year?.message} />
              </div>
              <Input label="Department" name="department" placeholder="e.g. Computer Science" register={regProfile} error={profileErrors.department?.message} />
              <Input label="Avatar URL" name="avatar" type="url" placeholder="https://example.com/avatar.jpg" register={regProfile} error={profileErrors.avatar?.message} />
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={profileMutation.isPending}>Save Changes</Button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="bg-black/50 backdrop-blur-sm border-l-4 border-l-pink border border-border rounded-2xl p-6">
            <h2 className="text-display text-xl text-white tracking-[2px] mb-5 border-b border-raised pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink" /> CHANGE PASSWORD
            </h2>
            <form onSubmit={handlePwd((d) => passwordMutation.mutate(d))} noValidate className="space-y-4">
              <Input label="Current Password" name="currentPassword" type="password" register={regPwd} error={pwdErrors.currentPassword?.message} required />
              <Input label="New Password" name="newPassword" type="password" placeholder="Min. 8 chars, 1 uppercase, 1 number" register={regPwd} error={pwdErrors.newPassword?.message} required />
              <Input label="Confirm New Password" name="confirmPassword" type="password" register={regPwd} error={pwdErrors.confirmPassword?.message} required />
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={passwordMutation.isPending}>Update Password</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
