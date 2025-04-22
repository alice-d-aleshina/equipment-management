import { supabase } from './supabase';

export type Equipment = {
  id: number;
  name: string;
  name_en?: string;
  type?: string;
  status?: 'available' | 'in_use' | 'maintenance' | 'broken' | 'checked-out';
  location?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  assigned_to?: number;
  qr_code?: string;
  checked_out_by?: number;
  checked_out_at?: string;
  group_name?: string;
  owner?: string;
  room_id?: number;
  building_id?: number;
  lab_id?: number;
  created_at?: string;
};

type EquipmentFilter = {
  status?: Equipment['status'];
  type?: string;
  room_id?: number;
  building_id?: number;
  lab_id?: number;
  assigned_to?: number;
  group_name?: string;
};

/**
 * Get all equipment items with optional filtering
 */
export async function getEquipment(filters?: EquipmentFilter) {
  let query = supabase.from('equipment').select('*');
  
  if (filters) {
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.room_id) query = query.eq('room_id', filters.room_id);
    if (filters.building_id) query = query.eq('building_id', filters.building_id);
    if (filters.lab_id) query = query.eq('lab_id', filters.lab_id);
    if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
    if (filters.group_name) query = query.eq('group_name', filters.group_name);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching equipment: ${error.message}`);
  }
  
  return data;
}

/**
 * Get equipment by ID
 */
export async function getEquipmentById(id: number) {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Error fetching equipment by ID: ${error.message}`);
  }
  
  return data;
}

/**
 * Get equipment by QR code
 */
export async function getEquipmentByQrCode(qrCode: string) {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('qr_code', qrCode)
    .single();
  
  if (error) {
    throw new Error(`Error fetching equipment by QR code: ${error.message}`);
  }
  
  return data;
}

/**
 * Create a new equipment item
 */
export async function createEquipment(equipment: Omit<Equipment, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('equipment')
    .insert([equipment])
    .select();
  
  if (error) {
    throw new Error(`Error creating equipment: ${error.message}`);
  }
  
  return data[0];
}

/**
 * Update an existing equipment item
 */
export async function updateEquipment(id: number, updates: Partial<Equipment>) {
  const { data, error } = await supabase
    .from('equipment')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    throw new Error(`Error updating equipment: ${error.message}`);
  }
  
  return data[0];
}

/**
 * Check out equipment to a user
 */
export async function checkoutEquipment(equipmentId: number, userId: number) {
  const { data, error } = await supabase
    .from('equipment')
    .update({
      status: 'checked-out',
      checked_out_by: userId,
      checked_out_at: new Date().toISOString(),
    })
    .eq('id', equipmentId)
    .select();
  
  if (error) {
    throw new Error(`Error checking out equipment: ${error.message}`);
  }
  
  return data[0];
}

/**
 * Check in equipment (return from a user)
 */
export async function checkinEquipment(equipmentId: number) {
  const { data, error } = await supabase
    .from('equipment')
    .update({
      status: 'available',
      checked_out_by: null,
      checked_out_at: null,
    })
    .eq('id', equipmentId)
    .select();
  
  if (error) {
    throw new Error(`Error checking in equipment: ${error.message}`);
  }
  
  return data[0];
}

/**
 * Search equipment by name
 */
export async function searchEquipmentByName(query: string) {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name');
  
  if (error) {
    throw new Error(`Error searching equipment by name: ${error.message}`);
  }
  
  return data;
} 