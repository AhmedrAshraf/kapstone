import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase-types';

// Get and validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please click the "Connect to Supabase" button in the top right to set up your connection.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    'Invalid VITE_SUPABASE_URL format. Please ensure it is a valid URL.'
  );
}

// Create the Supabase client with retries and timeouts
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'kapstone-auth',
  },
  global: {
    headers: { 'x-client-info': 'kapstone-clinics' },
  },
  db: {
    schema: 'public',
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  // Add request timeout and retry configuration
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    }).catch(async (error) => {
      if (error.name === 'AbortError') {
        console.error('Request timeout, retrying...');
        // Retry once with increased timeout
        return fetch(url, {
          ...options,
          signal: AbortSignal.timeout(20000), // 20 second timeout on retry
        });
      }
      throw error;
    });
  }
});

// Simplified connection test that avoids RLS issues
export async function testConnection(retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Test auth system availability
      // First check system health
      const { data: healthCheck, error: healthError } = await supabase
        .rpc('check_content_system', {});

      if (healthError) {
        console.warn('Health check failed:', healthError.message);
        throw healthError;
      }

      if (!healthCheck || healthCheck.status === 'error') {
        throw new Error('Content system health check failed');
      }

      if (healthCheck.status === 'degraded') {
        console.warn('Content system health is degraded:', healthCheck.details);
      }

      // Then check auth system
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.warn('Auth system check:', authError.message);
        if (attempt === retries) return false;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      // Log connection status
      console.debug('Supabase connection established', {
        authenticated: !!session,
        url: supabaseUrl.split('@')[1] // Log domain only, not full URL
      });

      return true;
    } catch (error) {
      console.warn(`Connection attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        console.error('Connection test failed:', error);
        return false;
      }
      
      // Exponential backoff
      const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  return false;
}

// Initialize connection test
testConnection()
  .then(success => {
    if (!success) {
      console.error('Failed to establish initial connection to Supabase');
    }
  })
  .catch(error => {
    console.error('Error during initial connection test:', error);
  });

// Initialize auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  try {
    console.debug('Auth state changed:', { event, email: session?.user?.email });
    
    switch (event) {
      case 'SIGNED_IN':
        console.debug('User signed in successfully');
        break;
      case 'SIGNED_OUT':
        console.debug('User signed out');
        localStorage.removeItem('kapstone-auth');
        break;
      case 'USER_UPDATED':
        console.debug('User profile updated');
        break;
      case 'USER_DELETED':
        console.debug('User account deleted');
        localStorage.removeItem('kapstone-auth');
        break;
      case 'PASSWORD_RECOVERY':
        console.debug('Password recovery initiated');
        break;
    }
  } catch (error) {
    console.error('Error handling auth state change:', error);
  }
});