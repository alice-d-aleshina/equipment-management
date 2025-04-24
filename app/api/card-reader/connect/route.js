import { NextResponse } from 'next/server';

// Shared state for the card reader connection
// In a real application, this would be part of a proper state management system
let readerState = {
  connected: false,
  status: 'Disconnected',
  cardPresent: false,
  cardId: '',
  cardType: '',
  uptime: 0,
  lastConnectTime: null,
  port: null,
  parser: null
};

/**
 * POST /api/card-reader/connect
 * Connect to the card reader on a specific port
 */
export async function POST(request) {
  try {
    const data = await request.json();
    const { port } = data;
    
    if (!port) {
      return NextResponse.json(
        { error: 'Port is required' },
        { status: 400 }
      );
    }

    // In production, you would establish a real connection using SerialPort
    // Here we simulate connecting
    console.log(`Connecting to Arduino on port: ${port}`);
    
    // For now, we're just updating the state to simulate a connection
    readerState = {
      ...readerState,
      connected: true,
      status: `Connected to ${port}`,
      lastConnectTime: new Date(),
      uptime: 0
    };
    
    return NextResponse.json({
      connected: true,
      status: readerState.status
    });
  } catch (error) {
    console.error('Error connecting to card reader:', error);
    return NextResponse.json(
      { error: `Failed to connect to card reader: ${error.message}` },
      { status: 500 }
    );
  }
}

// Export the reader state for use in other route handlers
export { readerState }; 