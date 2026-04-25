'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { RegisterRequest } from '../../types/api';

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
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    clearError();
    try {
      // Map form data to API request format
      const registerData: RegisterRequest = {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || undefined,
        password: data.password,
        password_confirm: data.password_confirm,
        role_id: data.role_id,
      };
      
      await registerUser(registerData);
      console.log('Registration successful');
      
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle API errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle field-specific errors
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach((field) => {
            if (Array.isArray(errorData[field])) {
              setError(field as keyof SignupFormData, {
                message: errorData[field][0],
              });
            }
          });
        }
        
        // Handle non-field errors
        if (errorData.non_field_errors) {
          setError('root', { message: errorData.non_field_errors[0] });
        } else if (errorData.detail) {
          setError('root', { message: errorData.detail });
        }
      } else {
        setError('root', { message: 'An error occurred during signup. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-surface via-background to-surface">
      {/* Left Side - Branding & Visual Elements */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-secondary/10 to-primary/20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white drop-shadow-lg mb-4 heading-emotional">
              💍 Perfect Wedding
            </h1>
            <p className="text-xl text-white/90 body-emotional max-w-md">
              Begin your journey to a perfect celebration
            </p>
          </div>
          
          <div className="space-y-6 max-w-md">
            <div className="glass-card p-6 border-l-4 border-secondary">
              <h3 className="text-lg font-semibold text-text-primary heading-emotional mb-2">
                🎯 Personalized Planning
              </h3>
              <p className="text-text-secondary body-data">
                Get tailored recommendations based on your wedding style and preferences
              </p>
            </div>
            
            <div className="glass-card p-6 border-l-4 border-primary">
              <h3 className="text-lg font-semibold text-text-primary heading-emotional mb-2">
                📊 Smart Budget Management
              </h3>
              <p className="text-text-secondary body-data">
                Track expenses, manage vendors, and stay within your wedding budget
              </p>
            </div>
            
            <div className="glass-card p-6 border-l-4 border-accent">
              <h3 className="text-lg font-semibold text-text-primary heading-emotional mb-2">
                💌 Digital Invitations
              </h3>
              <p className="text-text-secondary body-data">
                Create beautiful digital invitations and manage guest RSVPs effortlessly
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-text-muted body-data">
              Start planning today - your dream wedding awaits!
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary heading-emotional mb-2">
              Create Your Account
            </h2>
            <p className="text-text-secondary body-data">
              Join us and start planning your perfect wedding
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="glass-card p-8 space-y-6">
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.root.message}
                </div>
              )}
              
              {error && !errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
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
                    autoComplete="username"
                    className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                    }`}
                    placeholder="Choose a username"
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
                    autoComplete="email"
                    className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                    }`}
                    placeholder="your@email.com"
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
                      autoComplete="given-name"
                      className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                        errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                      }`}
                      placeholder="First name"
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
                      autoComplete="family-name"
                      className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                        errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                      }`}
                      placeholder="Last name"
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
                    autoComplete="tel"
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
                    I am the... *
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
                    autoComplete="new-password"
                    className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                    }`}
                    placeholder="Create a strong password"
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
                    autoComplete="new-password"
                    className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                      errors.password_confirm ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                    }`}
                    placeholder="Confirm your password"
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
                  className="w-full btn-primary flex justify-center py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-text-muted body-data mb-4">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-primary hover:text-secondary transition-colors">
                    Sign in
                  </Link>
                </p>
                
                {/* Quick Signup Buttons for Testing */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600 font-medium mb-3 label-ui">QUICK SIGNUP FOR TESTING</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setValue('username', 'bride_demo');
                        setValue('email', 'bride@weddingdemo.com');
                        setValue('first_name', 'Sarah');
                        setValue('last_name', 'Johnson');
                        setValue('phone', '+1 (555) 123-4567');
                        setValue('password', 'Demo123!@#');
                        setValue('password_confirm', 'Demo123!@#');
                        setValue('role_id', 1); // Bride role
                      }}
                      className="px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      👰 Bride Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('username', 'groom_demo');
                        setValue('email', 'groom@weddingdemo.com');
                        setValue('first_name', 'Michael');
                        setValue('last_name', 'Johnson');
                        setValue('phone', '+1 (555) 987-6543');
                        setValue('password', 'Demo123!@#');
                        setValue('password_confirm', 'Demo123!@#');
                        setValue('role_id', 2); // Groom role
                      }}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      🤵 Groom Demo
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-2">Click to auto-fill form (Note: Users may already exist)</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
