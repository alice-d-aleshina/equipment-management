import { NextResponse } from 'next/server';
import { 
  getUserById, 
  updateUser,
  grantAccess,
  revokeAccess,
  getUserEquipment
} from '@/utils/userService';
import { mapUserToStudent, mapEquipmentToFrontend } from '@/lib/api';

// GET /api/users/[id] - get user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const includeEquipment = searchParams.get('equipment') === 'true';
    
    const user = await getUserById(userId);
    const mappedUser = mapUserToStudent(user);
    
    if (includeEquipment) {
      const equipment = await getUserEquipment(userId);
      const mappedEquipment = equipment.map(mapEquipmentToFrontend);
      
      return NextResponse.json({
        user: mappedUser,
        equipment: mappedEquipment
      });
    }
    
    return NextResponse.json(mappedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/users/[id] - update user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Transform frontend to backend format
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.group !== undefined) updates.group_name = body.group;
    if (body.hasAccess !== undefined) updates.has_access = body.hasAccess;
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    
    const updatedUser = await updateUser(userId, updates);
    const mappedUser = mapUserToStudent(updatedUser);
    
    return NextResponse.json(mappedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// POST /api/users/[id]/access - grant or revoke access
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'grant') {
      const updatedUser = await grantAccess(userId);
      const mappedUser = mapUserToStudent(updatedUser);
      return NextResponse.json(mappedUser);
    } else if (action === 'revoke') {
      const updatedUser = await revokeAccess(userId);
      const mappedUser = mapUserToStudent(updatedUser);
      return NextResponse.json(mappedUser);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error with user access:', error);
    return NextResponse.json({ error: 'Failed to update user access' }, { status: 500 });
  }
} 