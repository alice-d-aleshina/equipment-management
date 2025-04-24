import { NextResponse } from 'next/server';
import { readerState } from '../connect/route';

/**
 * GET /api/card-reader/status
 * Get the status of the card reader
 * 
 * NOTE: This is a simulation for development - in production, you would
 * need to run this on a server with access to SerialPort functionality.
 */
export async function GET(request) {
  try {
    // If connected, update uptime
    if (readerState.connected && readerState.lastConnectTime) {
      const now = new Date();
      const uptimeMs = now - readerState.lastConnectTime;
      readerState.uptime = Math.floor(uptimeMs / 1000);
    }

    console.log('Current reader status:', readerState);
    return NextResponse.json(readerState);
  } catch (error) {
    console.error('Error getting card reader status:', error);
    return NextResponse.json(
      { error: 'Failed to get card reader status' },
      { status: 500 }
    );
  }
} 