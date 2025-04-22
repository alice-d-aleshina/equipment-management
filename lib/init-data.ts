/**
 * This script initializes and caches data from Supabase
 * Run this during app initialization to pre-populate data
 */

import { 
  fetchAllEquipment, 
  fetchAllStudents, 
  fetchAllBuildings,
  fetchAllLabs,
  fetchAllRooms
} from './api';
import type { Equipment, Student, Building, Lab, Room } from './types';

// Cached data
let cachedEquipment: Equipment[] = [];
let cachedStudents: Student[] = [];
let cachedBuildings: Building[] = [];
let cachedLabs: Lab[] = [];
let cachedRooms: Room[] = [];
let isInitialized = false;

/**
 * Initialize all data from Supabase
 */
export async function initData() {
  try {
    const [equipment, students, buildings, labs, rooms] = await Promise.all([
      fetchAllEquipment(),
      fetchAllStudents(),
      fetchAllBuildings(),
      fetchAllLabs(),
      fetchAllRooms(),
    ]);
    
    cachedEquipment = equipment;
    cachedStudents = students;
    cachedBuildings = buildings;
    cachedLabs = labs;
    cachedRooms = rooms;
    
    isInitialized = true;
    
    return {
      equipment,
      students,
      buildings,
      labs,
      rooms,
    };
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
}

/**
 * Get cached equipment data
 */
export function getEquipment(): Equipment[] {
  return cachedEquipment;
}

/**
 * Get cached students data
 */
export function getStudents(): Student[] {
  return cachedStudents;
}

/**
 * Get cached buildings data
 */
export function getBuildings(): Building[] {
  return cachedBuildings;
}

/**
 * Get cached labs data
 */
export function getLabs(): Lab[] {
  return cachedLabs;
}

/**
 * Get cached rooms data
 */
export function getRooms(): Room[] {
  return cachedRooms;
}

/**
 * Update equipment in cache after operations
 */
export function updateEquipmentInCache(updatedEquipment: Equipment) {
  cachedEquipment = cachedEquipment.map(item => 
    item.id === updatedEquipment.id ? updatedEquipment : item
  );
}

/**
 * Update student in cache after operations
 */
export function updateStudentInCache(updatedStudent: Student) {
  cachedStudents = cachedStudents.map(student => 
    student.id === updatedStudent.id ? updatedStudent : student
  );
}

/**
 * Add new equipment to cache
 */
export function addEquipmentToCache(newEquipment: Equipment) {
  cachedEquipment.push(newEquipment);
}

/**
 * Add new student to cache
 */
export function addStudentToCache(newStudent: Student) {
  cachedStudents.push(newStudent);
}

/**
 * Check if data is initialized
 */
export function isDataInitialized() {
  return isInitialized;
} 