import { NextResponse } from 'next/server';
import { readerState } from '../connect/route';

/**
 * POST /api/card-reader/disconnect
 * Disconnect from the card reader
 */
export async function POST(request) {
  try {
    // Close the connection if it exists
    if (readerState.port) {
      // In production, you would close the real connection here
      console.log('Closing connection to Arduino');
    }
    
    // Reset the state
    readerState.connected = false;
    readerState.status = 'Disconnected';
    readerState.cardPresent = false;
    readerState.cardId = '';
    readerState.cardType = '';
    readerState.lastConnectTime = null;
    readerState.uptime = 0;
    readerState.port = null;
    readerState.parser = null;
    
    return NextResponse.json({
      connected: false,
      status: 'Disconnected'
    });
  } catch (error) {
    console.error('Error disconnecting from card reader:', error);
    return NextResponse.json(
      { error: `Failed to disconnect from card reader: ${error.message}` },
      { status: 500 }
    );
  }
} 