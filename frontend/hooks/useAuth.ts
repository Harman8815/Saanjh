'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services';
import { LoginRequest, RegisterRequest, User, AuthResponse } from '../types/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (credentials: LoginRequest) => AuthService.login(credentials),
    onSuccess: (data) => {
      AuthService.storeUser(data.user);
      queryClient.setQueryData(['user'], data.user);
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: (userData: RegisterRequest) => AuthService.register(userData),
    onSuccess: (data) => {
      AuthService.storeUser(data.user);
      queryClient.setQueryData(['user'], data.user);
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      AuthService.clearStoredUser();
      queryClient.clear();
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      AuthService.clearStoredUser();
      queryClient.clear();
      router.push('/login');
    },
  });
}

// Profile update mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, Partial<User>>({
    mutationFn: (userData: Partial<User>) => AuthService.updateProfile(userData),
    onSuccess: (updatedUser) => {
      AuthService.storeUser(updatedUser);
      queryClient.setQueryData(['user'], updatedUser);
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
}

// Get user profile query
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => AuthService.getProfile(),
    enabled: AuthService.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get user statistics query
export function useUserStats() {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => AuthService.getUserStats(),
    enabled: AuthService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to protect routes - redirects to login if not authenticated
export function useRequireAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication status from localStorage
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const user = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
      const authStatus = !!(token && user);

      setIsAuthenticated(authStatus);
      setIsChecking(false);

      if (!authStatus) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Don't render anything while checking auth
  if (isChecking) {
    return null;
  }

  return isAuthenticated;
}
