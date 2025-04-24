import { NextResponse } from 'next/server';
import { readerState } from '../connect/route';

/**
 * POST /api/card-reader/reset
 * Reset the card reader
 * 
 * NOTE: This is a simulation for development - in production, you would
 * need to run this on a server with access to SerialPort functionality.
 */
export async function POST(request) {
  try {
    // Only allow reset if connected
    if (!readerState.connected) {
      return NextResponse.json(
        { error: 'Card reader is not connected' },
        { status: 400 }
      );
    }

    // In production, you would send a reset command to the Arduino
    console.log('Sending reset command to Arduino');
    
    // Update the reader state - maintain connection but reset card
    readerState.status = 'Connected - Reset complete';
    readerState.cardPresent = false;
    readerState.cardId = '';
    readerState.cardType = '';
    
    return NextResponse.json({
      success: true,
      status: readerState.status
    });
  } catch (error) {
    console.error('Error resetting card reader:', error);
    return NextResponse.json(
      { error: `Failed to reset card reader: ${error.message}` },
      { status: 500 }
    );
  }
} 