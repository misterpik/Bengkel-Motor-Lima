import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, ensureUserProfile } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  tenantId: string | null;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, workshopName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  tenantId: null,
  signOut: async () => {},
  signUp: async () => {},
  signIn: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await ensureUserProfile();
      setProfile(userProfile);
      setTenantId(userProfile?.tenant_id || null);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, workshopName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          workshop_name: workshopName || `Bengkel ${fullName.split(' ')[0]}`
        }
      }
    });

    if (error) throw error;

    // If user is created immediately (no email confirmation required)
    if (data.user && !data.user.email_confirmed_at) {
      // Create tenant and profile
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: workshopName || `Bengkel ${fullName.split(' ')[0]}`,
          owner_name: fullName,
          email: email,
          status: 'Trial',
          package: 'Basic'
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      if (tenant) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            tenant_id: tenant.id,
            role: 'bengkel_owner',
            full_name: fullName
          });

        if (profileError) throw profileError;
      }
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          await refreshProfile();
        } else {
          setProfile(null);
          setTenantId(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !profile) {
      refreshProfile();
    }
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setTenantId(null);
  };

  const value = {
    user,
    session,
    loading,
    profile,
    tenantId,
    signOut,
    signUp,
    signIn,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};