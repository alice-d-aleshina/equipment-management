import { supabase } from '@/utils/supabase';
import { Equipment, Student, Building, Lab, Room } from './types';
import { getEquipment } from '@/utils/equipmentService';
import { getUsers } from '@/utils/userService';
import { getBuildings, getLabs, getRooms } from '@/utils/locationService';

// Convert database equipment to frontend format
export const mapEquipmentToFrontend = (item: any): Equipment => {
  return {
    id: item.id.toString(),
    name: item.name || '',
    nameEn: item.name_en || '',
    type: item.type || '',
    status: item.status || 'available',
    location: item.location || '',
    lastMaintenance: item.last_maintenance || '',
    nextMaintenance: item.next_maintenance || '',
    assignedTo: item.assigned_to ? item.assigned_to.toString() : undefined,
    qrCode: item.qr_code || '',
    checkedOutBy: item.checked_out_by ? item.checked_out_by.toString() : null,
    checkedOutAt: item.checked_out_at ? new Date(item.checked_out_at) : null,
    group: item.group_name || '',
    owner: item.owner || '',
    room: item.room_id || 0,
    building: item.building_id || 0,
    lab: item.lab_id || 0,
  };
};

// Convert database user to frontend student format
export const mapUserToStudent = (user: any): Student => {
  return {
    id: user.id.toString(),
    name: user.name || '',
    group: user.group_name || '',
    hasAccess: user.has_access || false,
    email: user.email || '',
    phone: user.phone || '',
  };
};

// Convert database building to frontend format
export const mapBuildingToFrontend = (building: any): Building => {
  return {
    id: building.id,
    name: building.name,
  };
};

// Convert database lab to frontend format
export const mapLabToFrontend = (lab: any): Lab => {
  return {
    id: lab.id,
    name: lab.name,
    buildingId: lab.building_id,
  };
};

// Convert database room to frontend format
export const mapRoomToFrontend = (room: any): Room => {
  return {
    id: room.id,
    name: room.name,
    labId: room.lab_id,
  };
};

// Fetch all equipment
export const fetchAllEquipment = async (): Promise<Equipment[]> => {
  try {
    const data = await getEquipment();
    return data.map(mapEquipmentToFrontend);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
};

// Fetch equipment by status
export const fetchEquipmentByStatus = async (status: string): Promise<Equipment[]> => {
  try {
    const data = await getEquipment({ status: status as any });
    return data.map(mapEquipmentToFrontend);
  } catch (error) {
    console.error('Error fetching equipment by status:', error);
    return [];
  }
};

// Fetch all students (users)
export const fetchAllStudents = async (): Promise<Student[]> => {
  try {
    const data = await getUsers();
    return data.map(mapUserToStudent);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Fetch students by access status
export const fetchStudentsByAccess = async (hasAccess: boolean): Promise<Student[]> => {
  try {
    const data = await getUsers({ has_access: hasAccess });
    return data.map(mapUserToStudent);
  } catch (error) {
    console.error('Error fetching users by access:', error);
    return [];
  }
};

// Fetch all buildings
export const fetchAllBuildings = async (): Promise<Building[]> => {
  try {
    const data = await getBuildings();
    return data.map(mapBuildingToFrontend);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return [];
  }
};

// Fetch all labs
export const fetchAllLabs = async (): Promise<Lab[]> => {
  try {
    const data = await getLabs();
    return data.map(mapLabToFrontend);
  } catch (error) {
    console.error('Error fetching labs:', error);
    return [];
  }
};

// Fetch labs by building
export const fetchLabsByBuilding = async (buildingId: number): Promise<Lab[]> => {
  try {
    const data = await getLabs(buildingId);
    return data.map(mapLabToFrontend);
  } catch (error) {
    console.error('Error fetching labs by building:', error);
    return [];
  }
};

// Fetch all rooms
export const fetchAllRooms = async (): Promise<Room[]> => {
  try {
    const data = await getRooms();
    return data.map(mapRoomToFrontend);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

// Fetch rooms by lab
export const fetchRoomsByLab = async (labId: number): Promise<Room[]> => {
  try {
    const data = await getRooms(labId);
    return data.map(mapRoomToFrontend);
  } catch (error) {
    console.error('Error fetching rooms by lab:', error);
    return [];
  }
}; 