import { NextResponse } from 'next/server';

/**
 * GET /api/card-reader
 * Проверка статуса card reader
 */
export async function GET(request) {
  try {
    // На Vercel возвращаем заглушку, так как serialport недоступен
    if (process.env.VERCEL) {
      return NextResponse.json({
        status: 'Недоступно на Vercel',
        environment: 'vercel',
        message: 'Аппаратные возможности недоступны в облачной среде Vercel'
      });
    }
    
    // В локальной среде возвращаем заглушку для тестирования
    return NextResponse.json({
      status: 'Симуляция',
      connected: false,
      environment: 'local',
      message: 'Используйте локальную среду для работы с оборудованием'
    });
    
  } catch (error) {
    console.error('Ошибка при запросе к card-reader API:', error);
    return NextResponse.json(
      { error: 'Ошибка при обработке запроса', message: error.message },
      { status: 500 }
    );
  }
} 