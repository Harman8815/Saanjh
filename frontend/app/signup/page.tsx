'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Please enter a valid email address'),
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phone: z.string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  password_confirm: z.string(),
  role_id: z.number()
    .min(1, 'Please select a role')
    .max(4, 'Invalid role selection'),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const ROLES = [
  { id: 1, name: 'Bride' },
  { id: 2, name: 'Groom' },
  { id: 3, name: 'Guardian' },
  { id: 4, name: 'Admin' },
];

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Signup data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Signup error:', error);
      setError('root', { message: 'An error occurred during signup' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-background to-surface py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-8 text-center text-4xl md:text-5xl font-bold text-text-primary heading-emotional">
            <span className="text-glow">Create Your Account</span>
          </h2>
          <p className="mt-4 text-center text-xl text-text-muted body-emotional max-w-sm mx-auto">
            Begin your journey to the perfect wedding
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="glass-card p-8 space-y-6">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.root.message}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-primary label-ui mb-2">
                  Username *
                </label>
                <input
                  {...register('username')}
                  type="text"
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                  }`}
                  placeholder="johndoe"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 body-data">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary label-ui mb-2">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 body-data">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-text-primary label-ui mb-2">
                    First Name *
                  </label>
                  <input
                    {...register('first_name')}
                    type="text"
                    className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                      errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                    }`}
                    placeholder="John"
                  />
                  {errors.first_name && (
                    <p className="mt-2 text-sm text-red-600 body-data">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-text-primary label-ui mb-2">
                    Last Name *
                  </label>
                  <input
                    {...register('last_name')}
                    type="text"
                    className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                      errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.last_name && (
                    <p className="mt-2 text-sm text-red-600 body-data">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-primary label-ui mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                    errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 body-data">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="role_id" className="block text-sm font-medium text-text-primary label-ui mb-2">
                  Role *
                </label>
                <select
                  {...register('role_id', { valueAsNumber: true })}
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                    errors.role_id ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                  }`}
                >
                  <option value="">Select your role</option>
                  {ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {errors.role_id && (
                  <p className="mt-2 text-sm text-red-600 body-data">{errors.role_id.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary label-ui mb-2">
                  Password *
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 body-data">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-text-primary label-ui mb-2">
                  Confirm Password *
                </label>
                <input
                  {...register('password_confirm')}
                  type="password"
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                    errors.password_confirm ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password_confirm && (
                  <p className="mt-2 text-sm text-red-600 body-data">{errors.password_confirm.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-full text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-text-muted body-data">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:text-secondary transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
