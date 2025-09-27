import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get current user's tenant ID
export const getCurrentTenantId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  return profile?.tenant_id || null;
};

// Helper function to ensure user has a profile and tenant
export const ensureUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single();

  if (profile) {
    return profile;
  }

  // If no profile exists, it means the user was created but profile creation failed
  // This can happen if the user was created via email confirmation
  // We need to create the tenant and profile now
  
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const workshopName = user.user_metadata?.workshop_name || `Bengkel ${fullName.split(' ')[0]}`;

  try {
    // Create tenant first
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: workshopName,
        owner_name: fullName,
        email: user.email || '',
        status: 'Trial',
        package: 'Basic'
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    if (tenant) {
      // Create profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          tenant_id: tenant.id,
          role: 'bengkel_owner',
          full_name: fullName
        })
        .select('*, tenants(*)')
        .single();

      if (profileError) throw profileError;
      return newProfile;
    }
  } catch (error) {
    console.error('Error creating profile:', error);
    // If there's an error, return null so the user can try again
    return null;
  }

  return null;
};