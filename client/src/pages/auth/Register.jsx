import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import useAuth from '../../hooks/useAuth.js';
import { getErrorMessage } from '../../utils/helpers.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';

const registerSchema = z
  .object({
    name:            z.string().min(2, 'At least 2 characters').max(100),
    email:           z.string().email('Valid email required'),
    password:        z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs uppercase').regex(/[0-9]/, 'Needs a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    rollNumber:      z.string().min(2, 'At least 2 characters').max(20),
    department:      z.string().min(1, 'Department is required'),
    year:            z.string().min(1, 'Year is required'),
    phone:           z.string().optional().refine((v) => !v || /^[+\d\s-]{7,15}$/.test(v), 'Invalid phone'),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const DEPARTMENTS = [
  'Computer Science','Information Technology','Electronics & Communication',
  'Electrical Engineering','Mechanical Engineering','Civil Engineering',
  'Chemical Engineering','Biotechnology','Business Administration',
  'Commerce','Arts & Humanities','Science','Other',
];
const DEPT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));
const YEAR_OPTIONS = [
  { value: '1', label: '1st Year' },{ value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },{ value: '4', label: '4th Year' },
  { value: '5', label: '5th Year' },
];

const Register = () => {
  const { register: authRegister } = useAuth();
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password', '');
  const passwordChecks = {
    length:    passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    number:    /[0-9]/.test(passwordValue),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const onSubmit = async (data) => {
    try {
      await authRegister({
        name: data.name, email: data.email, password: data.password,
        rollNumber: data.rollNumber, department: data.department,
        year: parseInt(data.year, 10), phone: data.phone || undefined,
      });
      toast.success('Account created! Welcome to CampusFlow!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-ink flex grain-bg">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-2/5 flex-col items-center justify-center p-12 relative overflow-hidden bg-black/50 backdrop-blur-sm border-r border-raised">
        <div className="absolute top-16 right-16 w-48 h-48 rounded-full border border-lime/20 animate-[spin_25s_linear_infinite]" />
        <div className="absolute bottom-16 left-16 w-72 h-72 rounded-full border border-border animate-[spin_35s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full" style={{ background: 'radial-gradient(circle, #4A108033 0%, transparent 70%)' }} />
        <div className="absolute top-24 left-24 w-3 h-3 rounded-full bg-lime animate-float" />
        <div className="absolute bottom-32 right-24 w-4 h-4 rounded-full bg-pink animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="w-10 h-10 text-lime fill-lime" />
          </div>
          <h1 className="text-display text-white" style={{ fontSize: 80, lineHeight: 0.9, letterSpacing: 4 }}>
            JOIN<br /><span className="text-lime">CAMPUS</span><br />FLOW
          </h1>
          <p className="text-muted mt-6 text-sm max-w-xs mx-auto">Create your account and start discovering amazing campus events</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="flex items-center gap-2 justify-center mb-6 lg:hidden">
            <Zap className="w-7 h-7 text-lime fill-lime" />
            <span className="text-display text-2xl text-lime tracking-[3px]">CAMPUSFLOW</span>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-8">
            <h2 className="text-display text-4xl text-white tracking-[2px] mb-1">JOIN CAMPUSFLOW</h2>
            <p className="text-muted text-sm mb-8">Create your student account</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" name="name" placeholder="Jane Doe" register={register} error={errors.name?.message} required />
                <Input label="Email" name="email" type="email" placeholder="jane@college.edu" register={register} error={errors.email?.message} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Roll Number" name="rollNumber" placeholder="CS2021001" register={register} error={errors.rollNumber?.message} required />
                <Input label="Phone" name="phone" type="tel" placeholder="+91 9876543210" register={register} error={errors.phone?.message} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Department" name="department" options={DEPT_OPTIONS} register={register} error={errors.department?.message} placeholder="Select department" required />
                <Select label="Year" name="year" options={YEAR_OPTIONS} register={register} error={errors.year?.message} placeholder="Select year" required />
              </div>

              {/* Password with show/hide */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary">
                  Password <span className="text-lime">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 chars, uppercase, number"
                    {...register('password')}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg bg-black/50 backdrop-blur-sm border border-border text-white placeholder:text-muted text-sm focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-lime transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-pink font-medium">{errors.password.message}</p>}

                {/* Strength indicator */}
                {passwordValue && (
                  <div className="mt-1 space-y-1.5">
                    <div className="flex gap-1">
                      {[1,2,3].map((lvl) => (
                        <div key={lvl} className="h-1 flex-1 rounded-full transition-colors duration-300"
                          style={{ background: passwordStrength >= lvl ? (passwordStrength === 1 ? '#FF3CAC' : passwordStrength === 2 ? '#F5E642' : '#AAFF00') : '#2D1050' }} />
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {[['length','8+ chars'],['uppercase','Uppercase'],['number','Number']].map(([k,l]) => (
                        <span key={k} className={`flex items-center gap-1 text-xs transition-colors ${passwordChecks[k] ? 'text-lime' : 'text-muted'}`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${passwordChecks[k] ? 'text-lime' : 'text-muted'}`} />{l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary">
                  Confirm Password <span className="text-lime">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    {...register('confirmPassword')}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg bg-black/50 backdrop-blur-sm border border-border text-white placeholder:text-muted text-sm focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-lime transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-pink font-medium">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-center text-xs text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan font-bold hover:text-lime transition-colors">Sign in here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
