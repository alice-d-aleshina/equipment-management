import { supabase } from './supabase';

export type Building = {
  id: number;
  name: string;
};

export type Lab = {
  id: number;
  name: string;
  building_id: number;
};

export type Room = {
  id: number;
  name: string;
  lab_id: number;
};

/**
 * Get all buildings
 */
export async function getBuildings() {
  const { data, error } = await supabase
    .from('buildings')
    .select('*');
  
  if (error) {
    throw new Error(`Error fetching buildings: ${error.message}`);
  }
  
  return data;
}

/**
 * Get building by ID
 */
export async function getBuildingById(id: number) {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Error fetching building by ID: ${error.message}`);
  }
  
  return data;
}

/**
 * Get all labs with optional building filter
 */
export async function getLabs(buildingId?: number) {
  let query = supabase.from('labs').select('*');
  
  if (buildingId) {
    query = query.eq('building_id', buildingId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching labs: ${error.message}`);
  }
  
  return data;
}

/**
 * Get lab by ID
 */
export async function getLabById(id: number) {
  const { data, error } = await supabase
    .from('labs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Error fetching lab by ID: ${error.message}`);
  }
  
  return data;
}

/**
 * Get all rooms with optional lab filter
 */
export async function getRooms(labId?: number) {
  let query = supabase.from('rooms').select('*');
  
  if (labId) {
    query = query.eq('lab_id', labId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching rooms: ${error.message}`);
  }
  
  return data;
}

/**
 * Get room by ID
 */
export async function getRoomById(id: number) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Error fetching room by ID: ${error.message}`);
  }
  
  return data;
}

/**
 * Get full location details for equipment
 */
export async function getLocationDetails(roomId?: number, labId?: number, buildingId?: number) {
  const location: {
    room?: Room;
    lab?: Lab;
    building?: Building;
  } = {};
  
  if (roomId) {
    const room = await getRoomById(roomId);
    location.room = room;
    labId = room.lab_id;
  }
  
  if (labId) {
    const lab = await getLabById(labId);
    location.lab = lab;
    buildingId = lab.building_id;
  }
  
  if (buildingId) {
    const building = await getBuildingById(buildingId);
    location.building = building;
  }
  
  return location;
} 