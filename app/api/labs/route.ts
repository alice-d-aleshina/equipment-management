import { NextResponse } from 'next/server';
import { getLabs } from '@/utils/locationService';
import { mapLabToFrontend } from '@/lib/api';

// GET /api/labs - get all labs with optional building filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('building_id');
    
    const data = await getLabs(buildingId ? parseInt(buildingId) : undefined);
    const mappedData = data.map(mapLabToFrontend);
    
    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Error fetching labs:', error);
    return NextResponse.json({ error: 'Failed to fetch labs' }, { status: 500 });
  }
} 