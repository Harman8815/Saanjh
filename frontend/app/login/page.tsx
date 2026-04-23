'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { LoginRequest } from '../../types/api';

const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      // Map form data to API request format
      const loginData: LoginRequest = {
        username: data.username,
        password: data.password,
      };
      
      await login(loginData.username, loginData.password);
      console.log('Login successful');
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle API errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle field-specific errors
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach((field) => {
            if (Array.isArray(errorData[field])) {
              setError(field as keyof LoginFormData, {
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
        setError('root', { message: 'Invalid username or password' });
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-surface via-background to-surface">
      {/* Left Side - Branding & Visual Elements */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gradient animate-glow mb-4 heading-emotional">
              💍 Perfect Wedding
            </h1>
            <p className="text-xl text-text-primary/90 body-emotional max-w-md">
              Where dreams begin and love stories unfold
            </p>
          </div>
          
          <div className="space-y-6 max-w-md">
            <div className="glass-card p-6 border-l-4 border-primary">
              <h3 className="text-lg font-semibold text-text-primary heading-emotional mb-2">
                ✨ Plan Your Perfect Day
              </h3>
              <p className="text-text-secondary body-data">
                Organize every detail of your wedding with our comprehensive planning tools
              </p>
            </div>
            
            <div className="glass-card p-6 border-l-4 border-secondary">
              <h3 className="text-lg font-semibold text-text-primary heading-emotional mb-2">
                👥 Manage Guests & Vendors
              </h3>
              <p className="text-text-secondary body-data">
                Keep track of RSVPs, vendor contacts, and budget all in one place
              </p>
            </div>
            
            <div className="glass-card p-6 border-l-4 border-accent">
              <h3 className="text-lg font-semibold text-text-primary heading-emotional mb-2">
                💝 Create Beautiful Memories
              </h3>
              <p className="text-text-secondary body-data">
                Design stunning wedding cards and share your special moments
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-text-muted body-data">
              Join thousands of couples planning their dream wedding
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary heading-emotional mb-2">
              Welcome Back
            </h2>
            <p className="text-text-secondary body-data">
              Sign in to continue planning your perfect wedding
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

              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-text-primary label-ui mb-2">
                    Username
                  </label>
                  <input
                    {...register('username')}
                    id="username"
                    type="text"
                    autoComplete="username"
                    className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                    }`}
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-600 body-data">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary label-ui mb-2">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 body-data ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/80'
                    }`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 body-data">{errors.password.message}</p>
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
                    'Sign In'
                  )}
                </button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-text-muted body-data mb-4">
                  Don't have an account?{' '}
                  <Link href="/signup" className="font-semibold text-primary hover:text-secondary transition-colors">
                    Sign up
                  </Link>
                </p>
                
                {/* Quick Login Buttons for Testing */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-3 label-ui">QUICK LOGIN FOR TESTING</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        console.log('Bride button clicked');
                        try {
                          // Method 1: Use setValue
                          setValue('username', 'bride_demo', { shouldValidate: true });
                          setValue('password', 'Demo123!@#', { shouldValidate: true });
                          
                          // Method 2: Also try reset as fallback
                          reset({
                            username: 'bride_demo',
                            password: 'Demo123!@#'
                          });
                          
                          // Show visual feedback
                          const button = e.currentTarget as HTMLButtonElement;
                          if (button) {
                            button.classList.add('ring-2', 'ring-pink-400', 'ring-offset-2');
                            setTimeout(() => {
                              button.classList.remove('ring-2', 'ring-pink-400', 'ring-offset-2');
                            }, 500);
                          }
                          
                          // Focus on username field to show the change
                          setTimeout(() => {
                            const usernameField = document.getElementById('username') as HTMLInputElement;
                            if (usernameField) {
                              usernameField.focus();
                              usernameField.select();
                            }
                          }, 100);
                        } catch (error) {
                          console.error('Error setting form values:', error);
                        }
                      }}
                      className="px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-xs font-medium transition-all duration-200"
                    >
                      👰 Bride Demo
                    </button>
                    <button
                      type="button"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        console.log('Groom button clicked');
                        try {
                          // Method 1: Use setValue
                          setValue('username', 'groom_demo', { shouldValidate: true });
                          setValue('password', 'Demo123!@#', { shouldValidate: true });
                          
                          // Method 2: Also try reset as fallback
                          reset({
                            username: 'groom_demo',
                            password: 'Demo123!@#'
                          });
                          
                          // Show visual feedback
                          const button = e.currentTarget as HTMLButtonElement;
                          if (button) {
                            button.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
                            setTimeout(() => {
                              button.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
                            }, 500);
                          }
                          
                          // Focus on username field to show the change
                          setTimeout(() => {
                            const usernameField = document.getElementById('username') as HTMLInputElement;
                            if (usernameField) {
                              usernameField.focus();
                              usernameField.select();
                            }
                          }, 100);
                        } catch (error) {
                          console.error('Error setting form values:', error);
                        }
                      }}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-all duration-200"
                    >
                      🤵 Groom Demo
                    </button>
                  </div>
                  <p className="text-xs text-blue-500 mt-2">Click to auto-fill credentials</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
