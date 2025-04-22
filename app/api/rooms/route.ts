import { NextResponse } from 'next/server';
import { getRooms } from '@/utils/locationService';
import { mapRoomToFrontend } from '@/lib/api';

// GET /api/rooms - get all rooms with optional lab filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const labId = searchParams.get('lab_id');
    
    const data = await getRooms(labId ? parseInt(labId) : undefined);
    const mappedData = data.map(mapRoomToFrontend);
    
    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
} 