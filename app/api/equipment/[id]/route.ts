import { NextResponse } from 'next/server';
import { 
  getEquipmentById, 
  updateEquipment,
  checkinEquipment,
  checkoutEquipment
} from '@/utils/equipmentService';
import { mapEquipmentToFrontend } from '@/lib/api';

// GET /api/equipment/[id] - get equipment by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    const equipmentId = parseInt(id);
    if (isNaN(equipmentId)) {
      return NextResponse.json({ error: 'Invalid equipment ID' }, { status: 400 });
    }

    const equipment = await getEquipmentById(equipmentId);
    const mappedEquipment = mapEquipmentToFrontend(equipment);
    
    return NextResponse.json(mappedEquipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

// PATCH /api/equipment/[id] - update equipment
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    const equipmentId = parseInt(id);
    if (isNaN(equipmentId)) {
      return NextResponse.json({ error: 'Invalid equipment ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Transform frontend to backend format
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.nameEn !== undefined) updates.name_en = body.nameEn;
    if (body.type !== undefined) updates.type = body.type;
    if (body.status !== undefined) updates.status = body.status;
    if (body.location !== undefined) updates.location = body.location;
    if (body.group !== undefined) updates.group_name = body.group;
    if (body.owner !== undefined) updates.owner = body.owner;
    if (body.room !== undefined) updates.room_id = body.room;
    if (body.building !== undefined) updates.building_id = body.building;
    if (body.lab !== undefined) updates.lab_id = body.lab;
    
    const updatedEquipment = await updateEquipment(equipmentId, updates);
    const mappedEquipment = mapEquipmentToFrontend(updatedEquipment);
    
    return NextResponse.json(mappedEquipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

// POST /api/equipment/[id]/checkout - checkout equipment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    const equipmentId = parseInt(id);
    if (isNaN(equipmentId)) {
      return NextResponse.json({ error: 'Invalid equipment ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'checkout') {
      const body = await request.json();
      const userId = parseInt(body.userId);
      
      if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }
      
      const updatedEquipment = await checkoutEquipment(equipmentId, userId);
      const mappedEquipment = mapEquipmentToFrontend(updatedEquipment);
      
      return NextResponse.json(mappedEquipment);
    } else if (action === 'checkin') {
      const updatedEquipment = await checkinEquipment(equipmentId);
      const mappedEquipment = mapEquipmentToFrontend(updatedEquipment);
      
      return NextResponse.json(mappedEquipment);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error with equipment action:', error);
    return NextResponse.json({ error: 'Failed to process equipment action' }, { status: 500 });
  }
} 