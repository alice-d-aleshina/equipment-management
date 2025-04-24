import { NextResponse } from 'next/server';
import CardReaderService from '../../../server/services/card-reader-service';

// Singleton instance of the card reader service
let cardReaderService;

// Initialize the card reader service
function getCardReaderService() {
  if (!cardReaderService) {
    cardReaderService = new CardReaderService();
  }
  return cardReaderService;
}

/**
 * GET /api/card-reader/status
 * Get the current status of the card reader
 */
export async function GET(request) {
  try {
    const service = getCardReaderService();
    
    const status = {
      connected: service.isConnected(),
      status: service.getLastStatus(),
      cardPresent: service.isCardPresent(),
      cardId: service.getLastCardId(),
      cardType: service.getLastCardType(),
      uptime: service.getUptime(),
    };
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting card reader status:', error);
    return NextResponse.json(
      { error: 'Failed to get card reader status' },
      { status: 500 }
    );
  }
} 