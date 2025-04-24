import { NextResponse } from 'next/server';
import { readerState } from '../connect/route';

/**
 * GET /api/card-reader/read-card
 * Wait for a card to be scanned
 * 
 * This is a long-polling endpoint that waits for a card to be scanned
 */
export async function GET(request) {
  try {
    // Check if reader is connected
    if (!readerState.connected) {
      return NextResponse.json(
        { error: 'Card reader is not connected' },
        { status: 400 }
      );
    }

    // In production, you would implement real card reading
    // For now, we're just checking if a card is present in our state
    if (readerState.cardPresent) {
      return NextResponse.json({
        cardPresent: true,
        cardId: readerState.cardId,
        cardType: readerState.cardType,
        timestamp: new Date().toISOString()
      });
    } else {
      // Return status that no card is present
      return NextResponse.json({
        cardPresent: false,
        status: "Waiting for card"
      });
    }
  } catch (error) {
    console.error('Error reading card:', error);
    return NextResponse.json(
      { error: `Failed to read card: ${error.message}` },
      { status: 500 }
    );
  }
} 