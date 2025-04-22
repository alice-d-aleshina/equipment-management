import { NextResponse } from 'next/server';
import { getUsers, createUser } from '@/utils/userService';
import { mapUserToStudent } from '@/lib/api';

// GET /api/users - get all users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hasAccess = searchParams.get('has_access');
    const groupName = searchParams.get('group_name');
    const userType = searchParams.get('user_type');
    
    const filters: any = {};
    if (hasAccess !== null) filters.has_access = hasAccess === 'true';
    if (groupName) filters.group_name = groupName;
    if (userType) filters.user_type = userType;
    
    const data = await getUsers(Object.keys(filters).length > 0 ? filters : undefined);
    
    // Map to frontend format
    const mappedData = data.map(mapUserToStudent);
    
    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - create new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Transform frontend to backend format
    const userData = {
      name: body.name,
      group_name: body.group,
      has_access: body.hasAccess || false,
      email: body.email,
      phone: body.phone,
      user_type: body.userType || 'student',
      email_verified: false
    };
    
    const newUser = await createUser(userData);
    const mappedUser = mapUserToStudent(newUser);
    
    return NextResponse.json(mappedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 