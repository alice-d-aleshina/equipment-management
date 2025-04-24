"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import type { Equipment, Student } from "@/lib/types"

interface CardReaderSimulatorProps {
  onCardDetected: (cardId: string) => void;
}

/**
 * Компонент для симуляции работы RFID-считывателя карт
 * Позволяет тестировать функциональность без физического устройства
 */
const CardReaderSimulator: React.FC<CardReaderSimulatorProps> = ({ 
  onCardDetected 
}) => {
  const [cardId, setCardId] = useState<string>('');
  const [readerStatus, setReaderStatus] = useState<'ready' | 'scanning' | 'success' | 'error'>('ready');
  const [lastScannedCard, setLastScannedCard] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Считыватель готов к работе');

  // Предустановленные ID карт для быстрого тестирования
  const sampleCards = [
    { id: '04A2B6D2CB5E80', label: 'Карта студента' },
    { id: 'F13D89AC42E7B5', label: 'Карта преподавателя' },
    { id: '7B349C2E8F15DA', label: 'Гостевая карта' },
  ];

  /**
   * Симуляция сканирования ID карты
   */
  const simulateScan = (id: string = cardId) => {
    // Проверка валидного ID карты
    if (!id.trim()) {
      setReaderStatus('error');
      setStatusMessage('Введите ID карты для сканирования');
      return;
    }

    // Начало процесса сканирования
    setReaderStatus('scanning');
    setStatusMessage('Сканирование карты...');

    // Имитация задержки чтения карты
    setTimeout(() => {
      try {
        // Имитируем успешное сканирование
        setReaderStatus('success');
        setStatusMessage(`Карта успешно считана: ${id}`);
        setLastScannedCard(id);
        
        // Отправляем результат в callback
        onCardDetected(id);
        
        // После задержки возвращаем в состояние "готов"
        setTimeout(() => {
          setReaderStatus('ready');
          setStatusMessage('Считыватель готов к работе');
        }, 2000);
      } catch (error) {
        // Имитируем ошибку при сканировании
        setReaderStatus('error');
        setStatusMessage('Ошибка при сканировании карты');
        
        // После задержки возвращаем в состояние "готов"
        setTimeout(() => {
          setReaderStatus('ready');
          setStatusMessage('Считыватель готов к работе');
        }, 2000);
      }
    }, 1500); // Задержка для реалистичности
  };

  /**
   * Выбор предустановленной карты
   */
  const selectSampleCard = (id: string) => {
    setCardId(id);
  };

  // Установка цвета индикатора статуса
  const getStatusColor = () => {
    switch (readerStatus) {
      case 'ready': return 'bg-blue-500';
      case 'scanning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Симулятор RFID-считывателя</CardTitle>
          <Badge className={`${getStatusColor()} text-white`}>
            {readerStatus === 'ready' && 'Готов к работе'}
            {readerStatus === 'scanning' && 'Сканирование...'}
            {readerStatus === 'success' && 'Успешно'}
            {readerStatus === 'error' && 'Ошибка'}
          </Badge>
        </div>
        <CardDescription>
          Виртуальный считыватель карт для тестирования
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`}></div>
          <p className="text-sm text-gray-600">{statusMessage}</p>
        </div>
        
        <div className="pt-2">
          <Label htmlFor="card-id" className="mb-1 block">ID карты</Label>
          <div className="flex space-x-2">
            <Input
              id="card-id"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              placeholder="Введите ID карты (например, F13D89AC42E7B5)"
              className="font-mono"
            />
            <Button 
              onClick={() => simulateScan()}
              disabled={readerStatus === 'scanning'}
              className="shrink-0"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Считать
            </Button>
          </div>
        </div>
        
        <div className="pt-2">
          <Label className="mb-2 block">Быстрое тестирование:</Label>
          <div className="flex flex-wrap gap-2">
            {sampleCards.map((card) => (
              <Button
                key={card.id}
                variant="outline"
                size="sm"
                onClick={() => selectSampleCard(card.id)}
                className="text-xs"
              >
                {card.label}
              </Button>
            ))}
          </div>
        </div>
        
        {lastScannedCard && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <Label className="mb-1 block text-sm">Последняя считанная карта:</Label>
            <code className="block font-mono text-sm">{lastScannedCard}</code>
            <div className="mt-1 flex items-center text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Карта считана успешно
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          Этот компонент эмулирует работу RFID считывателя для тестирования системы
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setReaderStatus('error');
            setStatusMessage('Симуляция ошибки чтения карты');
            setTimeout(() => {
              setReaderStatus('ready');
              setStatusMessage('Считыватель готов к работе');
            }, 2000);
          }}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Симуляция ошибки
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CardReaderSimulator;

