import { NextResponse } from 'next/server';
import { getBuildings } from '@/utils/locationService';
import { mapBuildingToFrontend } from '@/lib/api';

// GET /api/buildings - get all buildings
export async function GET() {
  try {
    const data = await getBuildings();
    const mappedData = data.map(mapBuildingToFrontend);
    
    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 });
  }
} 