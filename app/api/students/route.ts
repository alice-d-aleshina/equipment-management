import { NextResponse } from 'next/server';

// Define student type
interface Student {
  id: number;
  name: string;
  group: string;
  hasAccess: boolean;
  email: string;
  phone: string;
}

// Generate student data for the specified groups
const generateStudents = (): Student[] => {
  const students: Student[] = [];
  const groups = [
    'БИВ211', 'БИВ212', 'БИВ213', 'БИВ214', 'БИВ215', 'БИВ216',
    'БИБ211', 'БИБ212', 'БИБ213', 'БИБ214', 'БИБ215', 'БИБ216'
  ];
  
  let id = 1;
  
  groups.forEach(group => {
    // Generate 20-25 students per group
    const studentsInGroup = Math.floor(Math.random() * 6) + 20;
    
    for (let i = 0; i < studentsInGroup; i++) {
      students.push({
        id: id++,
        name: `Студент ${id}`,
        group: group,
        hasAccess: Math.random() > 0.5, // Randomly assign access
        email: `student${id}@university.edu`,
        phone: `+7 (999) ${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      });
    }
  });
  
  return students;
};

const students = generateStudents();

export async function GET() {
  return NextResponse.json(students);
} 