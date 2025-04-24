#!/usr/bin/env node

/**
 * Сервер для работы с RFID считывателем на Arduino
 * Этот скрипт устанавливает соединение с Arduino через последовательный порт
 * и обрабатывает считанные карты.
 * 
 * Использование:
 * node arduino-card-reader.js [порт]
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');

// Настройки
const DEFAULT_PORT = '/dev/cu.usbserial-1420';
const SERIAL_BAUD_RATE = 115200;
const SERVER_PORT = 3001;
const BACKEND_URL = 'http://localhost:3000';

// Глобальные переменные
let serialPort = null;
let parser = null;
let connected = false;
let lastCardId = '';
let lastCardType = '';
let cardPresent = false;
let lastStatus = 'Disconnected';
let lastConnectTime = null;
let io = null;

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
io = new Server(server, {
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
    connected,
    status: lastStatus,
    cardPresent,
    cardId: lastCardId,
    cardType: lastCardType
  });
  
  // Обработка отключения клиента
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Основная функция
async function main() {
  const portName = process.argv[2] || DEFAULT_PORT;
  console.log(`Arduino RFID Card Reader Server`);
  console.log(`------------------------------`);
  console.log(`Trying to connect to port: ${portName}`);
  
  try {
    await connectToPort(portName);
    startServer();
  } catch (error) {
    console.error(`Failed to start: ${error.message}`);
    process.exit(1);
  }
}

// Подключение к порту
async function connectToPort(portName) {
  return new Promise((resolve, reject) => {
    try {
      // Создание объекта порта
      serialPort = new SerialPort({
        path: portName,
        baudRate: SERIAL_BAUD_RATE,
        autoOpen: false
      });
      
      // Создание парсера для чтения строк
      parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));
      
      // Обработчики событий
      serialPort.on('open', () => {
        console.log(`Connected to ${portName}`);
        connected = true;
        lastStatus = 'Connected';
        lastConnectTime = new Date();
        
        // Уведомить всех клиентов о подключении
        if (io) {
          io.emit('connection_status', { connected: true });
        }
        
        resolve();
      });
      
      serialPort.on('error', (err) => {
        console.error(`Serial port error: ${err.message}`);
        connected = false;
        lastStatus = `Error: ${err.message}`;
        
        // Уведомить всех клиентов об ошибке
        if (io) {
          io.emit('connection_status', { connected: false, error: err.message });
        }
      });
      
      serialPort.on('close', () => {
        console.log('Connection closed');
        connected = false;
        lastStatus = 'Disconnected';
        
        // Уведомить всех клиентов о закрытии соединения
        if (io) {
          io.emit('connection_status', { connected: false });
        }
      });
      
      // Обработка данных от Arduino
      parser.on('data', (data) => {
        try {
          const message = data.toString().trim();
          console.log(`Received: ${message}`);
          
          // Попытка распарсить JSON
          try {
            const json = JSON.parse(message);
            processArduinoMessage(json);
          } catch (parseError) {
            console.log(`Not a JSON message: ${message}`);
            
            // Проверка на распознанный тип карты
            if (message.includes('Card Type:') || message.includes('MIFARE')) {
              console.log('Card type detected');
              lastStatus = `Card detected: ${message}`;
              
              // После обнаружения карты, запрашиваем её UID
              setTimeout(() => {
                // Отправка запроса UID
                if (serialPort && serialPort.isOpen) {
                  console.log('Requesting card UID...');
                  serialPort.write('g\n'); // Команда запроса UID
                }
              }, 200);
            }
            
            // Проверка на UID карты
            if (message.includes('UID:') || message.includes('Card UID:')) {
              const matches = message.match(/([0-9A-F][0-9A-F][ :]?){4,}/i);
              if (matches) {
                const cardId = matches[0].replace(/[ :]/g, '').toUpperCase();
                console.log(`Extracted card ID: ${cardId}`);
                
                cardPresent = true;
                lastCardId = cardId;
                lastCardType = 'MIFARE 1K'; // Из предыдущего сообщения
                lastStatus = `Card detected: ${lastCardId}`;
                
                // Отправляем данные карты через WebSocket
                if (io) {
                  io.emit('card_scan', { cardId: lastCardId, cardType: lastCardType });
                }
                
                // Проверка карты в Supabase через бэкенд
                verifyCardWithBackend(cardId);
              }
            }
            
            // Проверка на возможный ID карты (например "A6860588")
            if (message.match(/^[A-F0-9]{8,}$/i)) {
              const cardId = message.toUpperCase();
              console.log(`Possible card ID detected: ${cardId}`);
              
              cardPresent = true;
              lastCardId = cardId;
              lastCardType = 'Unknown Type';
              lastStatus = `Card detected: ${lastCardId}`;
              
              // Отправляем данные карты через WebSocket
              if (io) {
                io.emit('card_scan', { cardId: lastCardId, cardType: lastCardType });
              }
              
              // Проверка карты в Supabase через бэкенд
              verifyCardWithBackend(cardId);
            }
            
            // Проверяем формат из примера: "A 03"
            const formatMatches = message.match(/A (\d+)/i);
            if (formatMatches) {
              console.log(`Command identifier detected: A ${formatMatches[1]}`);
              // Это может быть команда или статус от считывателя
              // A 03 может указывать на обнаружение карты
            }
          }
        } catch (err) {
          console.error(`Error processing data: ${err.message}`);
        }
      });
      
      // Открытие порта
      serialPort.open((err) => {
        if (err) {
          console.error(`Error opening port: ${err.message}`);
          reject(err);
          return;
        }
        
        // Установка таймаута для инициализации Arduino
        setTimeout(() => {
          // После подключения отправляем команду для получения статуса
          sendCommandToArduino('status');
        }, 2000);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

// Обработка сообщений от Arduino
function processArduinoMessage(message) {
  if (message.type === 'card') {
    // Обработка считанной карты
    cardPresent = true;
    lastCardId = message.card_id;
    
    // Определение типа карты по ID
    lastCardType = detectCardType(message.card_id);
    
    lastStatus = `Card detected: ${lastCardId}`;
    console.log(`Card detected: ${lastCardId} (${lastCardType})`);
    
    // Отправляем данные карты через WebSocket
    if (io) {
      io.emit('card_scan', { cardId: lastCardId, cardType: lastCardType });
    }
    
    // Проверка карты в базе данных Supabase через бэкенд
    verifyCardWithBackend(lastCardId);
  } 
  else if (message.type === 'status') {
    // Обработка статусного сообщения
    lastStatus = `${message.status}: ${message.message}`;
    console.log(`Status: ${lastStatus}`);
    
    // Отправляем статус через WebSocket
    if (io) {
      io.emit('status_update', { status: lastStatus });
    }
  }
}

// Определение типа карты по ID
function detectCardType(cardId) {
  if (!cardId) return 'Unknown';
  
  cardId = cardId.toUpperCase();
  
  // Простые правила для демонстрации
  if (cardId.startsWith('04')) return 'Student Card';
  if (cardId.startsWith('F1')) return 'Faculty Card';
  if (cardId.startsWith('7B')) return 'Guest Card';
  
  return 'Unknown Card';
}

// Отправка команды на Arduino
function sendCommandToArduino(command, params = {}) {
  if (!serialPort || !serialPort.isOpen) {
    console.error('Cannot send command - port not open');
    return false;
  }
  
  try {
    const commandStr = JSON.stringify({ 
      cmd: command,
      ...params
    }) + '\n';
    
    serialPort.write(commandStr, (err) => {
      if (err) {
        console.error(`Error sending command: ${err.message}`);
        return;
      }
      console.log(`Sent command: ${command}`);
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending command: ${error.message}`);
    return false;
  }
}

// Добавим функцию запроса UID карты
function requestCardUID() {
  if (!serialPort || !serialPort.isOpen) {
    console.error('Cannot request UID - port not open');
    return false;
  }
  
  try {
    console.log('Sending UID request command...');
    // Очищаем предыдущие данные о карте
    cardPresent = false;
    lastCardId = '';
    
    // Отправка команды чтения UID
    serialPort.write('g\n');
    return true;
  } catch (error) {
    console.error(`Error requesting card UID: ${error.message}`);
    return false;
  }
}

// Функция для отправки данных карты на бэкенд
function sendCardDataToBackend(cardId, cardType) {
  if (!cardId) return;
  
  console.log(`Sending card data to backend: ${cardId} (${cardType})`);
  
  const cardData = {
    cardId: cardId,
    cardType: cardType,
    timestamp: new Date().toISOString(),
    source: 'arduino-reader'
  };
  
  // Отправка HTTP запроса на бэкенд
  axios.post(`${BACKEND_URL}/api/cards/scan`, cardData)
    .then(response => {
      console.log('Backend response:', response.data);
    })
    .catch(error => {
      console.error('Error sending data to backend:', error.message);
    });
}

// Функция для проверки карты через бэкенд с Supabase
function verifyCardWithBackend(cardId) {
  if (!cardId) return;
  
  console.log(`Verifying card in Supabase: ${cardId}`);
  
  // Отправка HTTP запроса на бэкенд для проверки карты
  axios.post(`${BACKEND_URL}/api/auth/verify-card`, { card_id: cardId })
    .then(response => {
      if (response.data && response.data.success) {
        // Карта найдена в базе данных
        const user = response.data.user;
        console.log('User found:', user);
        lastStatus = `Verified: ${user.name || user.email || 'User #' + user.id}`;
        
        // Визуальная индикация успешной верификации (через Arduino)
        sendCommandToArduino('led', { led: 'green', state: 1 });
        setTimeout(() => {
          sendCommandToArduino('led', { led: 'green', state: 0 });
        }, 2000);
        
        // Здесь можно добавить код для доступа к оборудованию
      } else {
        // Карта не найдена
        console.log('Card not found in database');
        lastStatus = 'Access denied: Unknown card';
        
        // Визуальная индикация отказа
        sendCommandToArduino('led', { led: 'red', state: 1 });
        setTimeout(() => {
          sendCommandToArduino('led', { led: 'red', state: 0 });
        }, 2000);
      }
    })
    .catch(error => {
      console.error('Error verifying card:', error.message);
      lastStatus = `Verification error: ${error.message}`;
      
      // Визуальная индикация ошибки
      sendCommandToArduino('led', { led: 'red', state: 1 });
      setTimeout(() => {
        sendCommandToArduino('led', { led: 'red', state: 0 });
      }, 2000);
    });
}

// Запуск HTTP сервера
function startServer() {
  // API эндпоинты
  
  // Получение статуса
  app.get('/api/status', (req, res) => {
    const uptime = connected && lastConnectTime ? 
      Math.floor((new Date() - lastConnectTime) / 1000) : 0;
    
    res.json({
      connected,
      status: lastStatus,
      cardPresent,
      cardId: lastCardId,
      cardType: lastCardType,
      uptime
    });
  });
  
  // Подключение к порту
  app.post('/api/connect', async (req, res) => {
    const { port } = req.body;
    
    if (!port) {
      return res.status(400).json({ error: 'Port is required' });
    }
    
    // Закрыть существующее соединение
    if (serialPort && serialPort.isOpen) {
      serialPort.close();
    }
    
    try {
      await connectToPort(port);
      res.json({
        connected: true,
        status: lastStatus
      });
    } catch (error) {
      res.status(500).json({
        error: `Failed to connect: ${error.message}`
      });
    }
  });
  
  // Отключение
  app.post('/api/disconnect', (req, res) => {
    if (serialPort && serialPort.isOpen) {
      serialPort.close((err) => {
        if (err) {
          return res.status(500).json({
            error: `Failed to disconnect: ${err.message}`
          });
        }
        
        connected = false;
        lastStatus = 'Disconnected';
        cardPresent = false;
        lastCardId = '';
        lastCardType = '';
        
        res.json({
          connected: false,
          status: 'Disconnected'
        });
      });
    } else {
      res.json({
        connected: false,
        status: 'Already disconnected'
      });
    }
  });
  
  // Сброс считывателя
  app.post('/api/reset', (req, res) => {
    if (!connected) {
      return res.status(400).json({ error: 'Not connected' });
    }
    
    const success = sendCommandToArduino('reset');
    
    if (success) {
      cardPresent = false;
      lastCardId = '';
      lastCardType = '';
      lastStatus = 'Reset command sent';
      
      res.json({
        success: true,
        status: lastStatus
      });
    } else {
      res.status(500).json({
        error: 'Failed to send reset command'
      });
    }
  });
  
  // Чтение карты
  app.get('/api/read-card', (req, res) => {
    if (!connected) {
      return res.status(400).json({ error: 'Not connected' });
    }
    
    if (cardPresent) {
      res.json({
        cardPresent,
        cardId: lastCardId,
        cardType: lastCardType,
        timestamp: new Date().toISOString()
      });
      
      // После успешного чтения, сбрасываем состояние, чтобы не читать ту же карту многократно
      // В реальном применении это может быть нежелательно, зависит от требований
      cardPresent = false;
    } else {
      res.json({
        cardPresent: false,
        status: 'Waiting for card'
      });
    }
  });
  
  // Список портов
  app.get('/api/ports', async (req, res) => {
    try {
      const ports = await SerialPort.list();
      res.json(ports);
    } catch (error) {
      res.status(500).json({
        error: `Failed to list ports: ${error.message}`
      });
    }
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
    lastCardType = detectCardType(lastCardId);
    lastStatus = `Card detected (simulated): ${lastCardId}`;
    
    console.log(`Manual card simulation: ${lastCardId} (${lastCardType})`);
    
    res.json({
      success: true,
      cardId: lastCardId,
      cardType: lastCardType,
      timestamp: new Date().toISOString()
    });
  });
  
  // Запрос UID карты
  app.post('/api/request-uid', (req, res) => {
    if (!connected) {
      return res.status(400).json({ error: 'Not connected' });
    }
    
    const success = requestCardUID();
    
    if (success) {
      res.json({
        success: true,
        status: 'UID request sent'
      });
    } else {
      res.status(500).json({
        error: 'Failed to send UID request'
      });
    }
  });
  
  // Запуск сервера
  server.listen(SERVER_PORT, () => {
    console.log(`Arduino RFID Server running on http://localhost:${SERVER_PORT}`);
    console.log('API endpoints:');
    console.log('  GET  /api/status     - Get reader status');
    console.log('  POST /api/connect    - Connect to port');
    console.log('  POST /api/disconnect - Disconnect from port');
    console.log('  POST /api/reset      - Reset reader');
    console.log('  GET  /api/read-card  - Read card (if present)');
    console.log('  GET  /api/ports      - List available ports');
    console.log('  POST /api/request-uid - Request card UID');
    console.log('  POST /api/simulate-scan - Simulate a card scan');
    console.log('WebSocket server is also running for real-time updates');
  });
}

// Запуск
main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});