import { NextResponse } from 'next/server';
import { 
  getEquipment, 
  getEquipmentById, 
  createEquipment, 
  updateEquipment,
  checkoutEquipment,
  checkinEquipment
} from '@/utils/equipmentService';
import { mapEquipmentToFrontend } from '@/lib/api';

interface Equipment {
  id: number;
  name: string;
  nameEn: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  assignedTo?: string;
  qrCode: string;
}

const equipment: Equipment[] = [
  {
    id: 1,
    name: 'Компьютер Dell Precision 5820',
    nameEn: 'Dell Precision 5820 Workstation',
    type: 'Рабочая станция',
    status: 'available',
    location: 'Лаборатория САПР',
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-06-15',
    qrCode: 'PC-001'
  },
  {
    id: 2,
    name: 'Компьютер Dell Precision 5820',
    nameEn: 'Dell Precision 5820 Workstation',
    type: 'Рабочая станция',
    status: 'in_use',
    location: 'Лаборатория САПР',
    lastMaintenance: '2023-12-10',
    nextMaintenance: '2024-06-10',
    assignedTo: 'БИВ213',
    qrCode: 'PC-002'
  },
  {
    id: 3,
    name: '3D-принтер Prusa i3 MK3S+',
    nameEn: 'Prusa i3 MK3S+ 3D Printer',
    type: '3D-принтер',
    status: 'available',
    location: 'Лаборатория 3D-моделирования',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-07-05',
    qrCode: '3DP-001'
  },
  {
    id: 4,
    name: '3D-сканер Artec Space Spider',
    nameEn: 'Artec Space Spider 3D Scanner',
    type: '3D-сканер',
    status: 'maintenance',
    location: 'Лаборатория 3D-моделирования',
    lastMaintenance: '2023-11-20',
    nextMaintenance: '2024-05-20',
    qrCode: '3DS-001'
  },
  {
    id: 5,
    name: 'Плоттер HP DesignJet T730',
    nameEn: 'HP DesignJet T730 Plotter',
    type: 'Плоттер',
    status: 'available',
    location: 'Лаборатория САПР',
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-08-01',
    qrCode: 'PLT-001'
  },
  {
    id: 6,
    name: 'Компьютер Dell Precision 5820',
    nameEn: 'Dell Precision 5820 Workstation',
    type: 'Рабочая станция',
    status: 'broken',
    location: 'Лаборатория САПР',
    lastMaintenance: '2023-10-15',
    nextMaintenance: '2024-04-15',
    qrCode: 'PC-003'
  },
  {
    id: 7,
    name: 'Компьютер Dell Precision 5820',
    nameEn: 'Dell Precision 5820 Workstation',
    type: 'Рабочая станция',
    status: 'in_use',
    location: 'Лаборатория САПР',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-07-20',
    assignedTo: 'БИБ214',
    qrCode: 'PC-004'
  },
  {
    id: 8,
    name: 'Компьютер Dell Precision 5820',
    nameEn: 'Dell Precision 5820 Workstation',
    type: 'Рабочая станция',
    status: 'available',
    location: 'Лаборатория САПР',
    lastMaintenance: '2023-12-05',
    nextMaintenance: '2024-06-05',
    qrCode: 'PC-005'
  },
  {
    id: 9,
    name: 'Компьютер Dell Precision 5820',
    nameEn: 'Dell Precision 5820 Workstation',
    type: 'Рабочая станция',
    status: 'in_use',
    location: 'Лаборатория САПР',
    lastMaintenance: '2024-02-10',
    nextMaintenance: '2024-08-10',
    assignedTo: 'БИВ215',
    qrCode: 'PC-006'
  },
  {
    id: 10,
    name: 'Компьютер Dell Precision 5820',
    nameEn: 'Dell Precision 5820 Workstation',
    type: 'Рабочая станция',
    status: 'available',
    location: 'Лаборатория САПР',
    lastMaintenance: '2023-11-25',
    nextMaintenance: '2024-05-25',
    qrCode: 'PC-007'
  }
];

// GET /api/equipment - get all equipment
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const roomId = searchParams.get('room_id');
    const buildingId = searchParams.get('building_id');
    const labId = searchParams.get('lab_id');
    const groupName = searchParams.get('group_name');
    
    const filters: any = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (roomId) filters.room_id = Number(roomId);
    if (buildingId) filters.building_id = Number(buildingId);
    if (labId) filters.lab_id = Number(labId);
    if (groupName) filters.group_name = groupName;
    
    const data = await getEquipment(Object.keys(filters).length > 0 ? filters : undefined);
    
    // Map to frontend format
    const mappedData = data.map(mapEquipmentToFrontend);
    
    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

// POST /api/equipment - create new equipment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Transform frontend to backend format
    const equipmentData = {
      name: body.name,
      name_en: body.nameEn,
      type: body.type,
      status: body.status || 'available',
      location: body.location,
      group_name: body.group,
      owner: body.owner,
      room_id: body.room || null,
      building_id: body.building || null,
      lab_id: body.lab || null,
      qr_code: body.qrCode || `eq-${Date.now()}`
    };
    
    const newEquipment = await createEquipment(equipmentData);
    const mappedEquipment = mapEquipmentToFrontend(newEquipment);
    
    return NextResponse.json(mappedEquipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
} 