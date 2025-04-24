import { NextResponse } from 'next/server';

// List of mock ports for fallback/development
const MOCK_PORTS = [
  {
    path: '/dev/cu.usbserial-1420',
    manufacturer: 'Silicon Labs',
    serialNumber: 'DN05LYKYA',
    pnpId: 'usb-Silicon_Labs_CP2102_USB_to_UART_Bridge_Controller',
    locationId: 'Port_#0001.Hub_#0001',
    vendorId: '10C4',
    productId: 'EA60'
  },
  {
    path: '/dev/cu.BLTH',
    manufacturer: 'Apple Inc.',
    serialNumber: '',
    vendorId: '',
    productId: ''
  },
  {
    path: '/dev/cu.Bluetooth-Incoming-Port',
    manufacturer: 'Apple Inc.',
    serialNumber: '',
    vendorId: '',
    productId: ''
  }
];

/**
 * GET /api/card-reader/ports
 * Get a list of available serial ports
 */
export async function GET(request) {
  // We can't use SerialPort directly in Edge Runtime or client-side
  // For testing, we'll return the mock ports
  try {
    // Return mock ports
    console.log('Returning available serial ports');
    return NextResponse.json(MOCK_PORTS);
  } catch (error) {
    console.error('Error listing serial ports:', error);
    return NextResponse.json(
      { error: 'Failed to list serial ports' },
      { status: 500 }
    );
  }
} 