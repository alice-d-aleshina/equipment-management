#!/usr/bin/env node

/**
 * Сервер для симуляции RFID считывателя без физического устройства
 * Запускает только WebSocket сервер для обработки симулированных сканирований
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Настройки
const SERVER_PORT = 3001;
const BACKEND_URL = 'http://localhost:3000';

// Глобальные переменные
let lastCardId = '';
let lastCardType = '';
let cardPresent = false;
let lastStatus = 'Simulator Mode';

// Создание HTTP сервера
const app = express();
// Разрешить всем источникам доступ к API
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Создание HTTP сервера и WebSocket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS']
  }
});

// WebSocket события
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Отправляем текущее состояние
  socket.emit('status', {
    connected: true,
    status: 'Simulator mode active',
    cardPresent,
    cardId: lastCardId,
    cardType: lastCardType
  });
  
  // Обработка симуляции сканирования карты от клиента
  socket.on('simulate_card_scan', (data) => {
    console.log('Simulating card scan:', data);
    
    // Обработка симулированной карты
    cardPresent = true;
    lastCardId = data.cardId || '04A2B6D2CB5E80';
    lastCardType = data.cardType || 'MIFARE 1K';
    lastStatus = `Card detected (simulated): ${lastCardId}`;
    
    // Отправляем данные карты всем подключенным клиентам
    io.emit('card_scan', { cardId: lastCardId, cardType: lastCardType });
    
    console.log(`Simulated card: ${lastCardId} (${lastCardType})`);
  });
  
  // Обработка отключения клиента
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API эндпоинты
  
// Получение статуса
app.get('/api/status', (req, res) => {
  res.json({
    connected: true,
    status: 'Simulator mode active',
    cardPresent,
    cardId: lastCardId,
    cardType: lastCardType,
    uptime: 0
  });
});

// Симуляция карты (для тестирования)
app.post('/api/simulate-scan', (req, res) => {
  const { cardId } = req.body;
  
  if (!cardId) {
    return res.status(400).json({ error: 'Card ID is required' });
  }
  
  // Имитируем обработку карты
  cardPresent = true;
  lastCardId = cardId.toUpperCase();
  lastCardType = 'MIFARE 1K';
  lastStatus = `Card detected (simulated): ${lastCardId}`;
  
  console.log(`Manual card simulation: ${lastCardId} (${lastCardType})`);
  
  // Отправляем данные карты через WebSocket
  io.emit('card_scan', { cardId: lastCardId, cardType: lastCardType });
  
  res.json({
    success: true,
    cardId: lastCardId,
    cardType: lastCardType,
    timestamp: new Date().toISOString()
  });
});

// Запуск сервера
server.listen(SERVER_PORT, () => {
  console.log(`Card Reader Simulator Server running on http://localhost:${SERVER_PORT}`);
  console.log('Running in simulation mode (no physical device)');
  console.log('API endpoints:');
  console.log('  GET  /api/status       - Get reader status');
  console.log('  POST /api/simulate-scan - Simulate a card scan');
  console.log('WebSocket server is running for real-time updates');
});

console.log('Card Reader Simulator Server started!');
console.log('Connect to WebSocket at ws://localhost:3001');
console.log('You can simulate card scans through the API or WebSocket'); 