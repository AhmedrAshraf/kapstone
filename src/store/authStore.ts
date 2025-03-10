import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  role: 'patient' | 'professional' | 'clinic_admin' | 'super_admin';
  full_name?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error('No user data returned from sign-in');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      set({ 
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role as User['role'],
          full_name: profile.full_name
        }, 
        isLoading: false, 
        error: null 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      set({ error: message, isLoading: false, user: null });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      console.log(message);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session || !session.user) {
        set({ user: null, isLoading: false, error: null });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      if (profileError) {
        // If profile fetch fails, sign out and clear state
        await supabase.auth.signOut();
        set({ user: null, isLoading: false, error: 'Session expired. Please sign in again.' });
        return;
      }

      set({ 
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role as User['role'],
          full_name: profile.full_name
        },
        isLoading: false, 
        error: null 
      });
    } catch (error) {
      // Handle session errors by signing out
      await supabase.auth.signOut();
      const message = error instanceof Error ? error.message : 'Authentication error';
      set({ user: null, error: message, isLoading: false });
    }
  },
}));