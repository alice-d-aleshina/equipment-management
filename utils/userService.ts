import { supabase } from './supabase';

export type User = {
  id: number;
  name: string;
  group_name?: string;
  email?: string;
  phone?: string;
  has_access: boolean;
  card_id?: string;
  user_type: string;
  email_verified: boolean;
  created_at?: string;
};

type UserFilter = {
  group_name?: string;
  has_access?: boolean;
  user_type?: string;
  email_verified?: boolean;
};

/**
 * Get all users with optional filtering
 */
export async function getUsers(filters?: UserFilter) {
  let query = supabase.from('users').select('*');
  
  if (filters) {
    if (filters.group_name) query = query.eq('group_name', filters.group_name);
    if (filters.has_access !== undefined) query = query.eq('has_access', filters.has_access);
    if (filters.user_type) query = query.eq('user_type', filters.user_type);
    if (filters.email_verified !== undefined) query = query.eq('email_verified', filters.email_verified);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
  
  return data;
}

/**
 * Get a user by ID
 */
export async function getUserById(id: number) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Error fetching user by ID: ${error.message}`);
  }
  
  return data;
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    throw new Error(`Error fetching user by email: ${error.message}`);
  }
  
  return data;
}

/**
 * Get a user by card ID
 */
export async function getUserByCardId(cardId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('card_id', cardId)
    .single();
  
  if (error) {
    throw new Error(`Error fetching user by card ID: ${error.message}`);
  }
  
  return data;
}

/**
 * Create a new user
 */
export async function createUser(user: Omit<User, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select();
  
  if (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
  
  return data[0];
}

/**
 * Update an existing user
 */
export async function updateUser(id: number, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
  
  return data[0];
}

/**
 * Grant access to a user
 */
export async function grantAccess(userId: number) {
  return updateUser(userId, { has_access: true });
}

/**
 * Revoke access from a user
 */
export async function revokeAccess(userId: number) {
  return updateUser(userId, { has_access: false });
}

/**
 * Get all equipment checked out by a specific user
 */
export async function getUserEquipment(userId: number) {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('checked_out_by', userId);
  
  if (error) {
    throw new Error(`Error fetching user equipment: ${error.message}`);
  }
  
  return data;
} 