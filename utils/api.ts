const API_BASE_URL = 'http://localhost:8000/api';

// Типы данных
export interface Student {
    id: number;
    name: string;
    email: string;
    phone: string;
    card_id: string;
    active: boolean;
    hasAccess: boolean;
    created?: string;
}

export interface Equipment {
    id: string;
    name: string;
    group?: string;
    status: string;
    owner: string;
    location: string;
    available: boolean;
    specifications?: Record<string, any>;
}

// API функции для работы со студентами
export const getStudents = async (): Promise<Student[]> => {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
};

export const addStudent = async (student: Omit<Student, 'id' | 'active' | 'hasAccess' | 'created'>): Promise<{ student_id: number }> => {
    const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
    });
    if (!response.ok) throw new Error('Failed to add student');
    return response.json();
};

export const toggleStudentAccess = async (studentId: number, roomId: number, grantAccess: boolean): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/access?room_id=${roomId}&grant_access=${grantAccess}`, {
        method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to toggle access');
    return response.json();
};

// API функции для работы с оборудованием
export const getEquipment = async (): Promise<Equipment[]> => {
    const response = await fetch(`${API_BASE_URL}/equipment`);
    if (!response.ok) throw new Error('Failed to fetch equipment');
    return response.json();
};

export const addEquipment = async (equipment: {
    inv_key: string;
    hardware_id: number;
    group_id?: number;
    status_id: number;
    owner: string;
    place_id: number;
    specifications?: Record<string, any>;
}): Promise<{ equipment_id: string }> => {
    const response = await fetch(`${API_BASE_URL}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipment)
    });
    if (!response.ok) throw new Error('Failed to add equipment');
    return response.json();
};

export const checkoutEquipment = async (
    equipmentId: string, 
    studentId: number, 
    returnDate: Date
): Promise<{ success: boolean; request_id: number }> => {
    const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            student_id: studentId,
            return_date: returnDate.toISOString()
        })
    });
    if (!response.ok) throw new Error('Failed to checkout equipment');
    return response.json();
};

export const returnEquipment = async (equipmentId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}/return`, {
        method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to return equipment');
    return response.json();
};

// Вспомогательные API функции
export const getRooms = async () => {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    if (!response.ok) throw new Error('Failed to fetch rooms');
    return response.json();
};

export const getHardwareTypes = async () => {
    const response = await fetch(`${API_BASE_URL}/hardware-types`);
    if (!response.ok) throw new Error('Failed to fetch hardware types');
    return response.json();
}; 