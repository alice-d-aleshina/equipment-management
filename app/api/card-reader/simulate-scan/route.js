import { NextResponse } from 'next/server';
import { readerState } from '../connect/route';

// Card types based on ID patterns
const detectCardType = (cardId) => {
  if (!cardId) return 'Unknown';
  
  // Simple pattern matching for demo purposes
  if (cardId.startsWith('04')) return 'Student Card';
  if (cardId.startsWith('F1')) return 'Faculty Card';
  if (cardId.startsWith('7B')) return 'Guest Card';
  
  return 'Unknown Card';
};

/**
 * POST /api/card-reader/simulate-scan
 * Simulate a card scan event
 * 
 * This endpoint is specifically for development and testing
 */
export async function POST(request) {
  try {
    const data = await request.json();
    const { cardId } = data;
    
    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }
    
    // Only allow if connected
    if (!readerState.connected) {
      return NextResponse.json(
        { error: 'Card reader is not connected' },
        { status: 400 }
      );
    }

    console.log(`Simulating card scan with ID: ${cardId}`);
    
    // Update the reader state
    const cardType = detectCardType(cardId);
    readerState.status = `Card detected: ${cardId}`;
    readerState.cardPresent = true;
    readerState.cardId = cardId;
    readerState.cardType = cardType;
    
    return NextResponse.json({
      success: true,
      cardId: cardId,
      cardType: cardType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error simulating card scan:', error);
    return NextResponse.json(
      { error: `Failed to simulate card scan: ${error.message}` },
      { status: 500 }
    );
  }
} 