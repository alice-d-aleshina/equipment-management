#!/usr/bin/env node

/**
 * Physical RFID Cards Server
 * 
 * Простой сервер для работы с физическими RFID картами через Arduino.
 * Предоставляет REST API для считывания карт и управления считывателем.
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
const cors = require('cors');

// Настройки по умолчанию
const DEFAULT_PORT = '/dev/cu.usbserial-1420'; // Порт по умолчанию
const DEFAULT_BAUDRATE = 9600; // Скорость передачи по умолчанию
const SERVER_PORT = 3001; // Порт HTTP сервера

// Глобальные переменные
let port = null;
let parser = null;
let isConnected = false;
let lastCardId = null;
let lastCardType = null;
let lastCardTimestamp = null;
let readCardPromise = null;
let readCardResolve = null;
let readCardTimeout = null;

// Инициализация Express
const app = express();
app.use(cors()); // Разрешаем CORS
app.use(express.json()); // Для парсинга JSON в теле запроса

/**
 * Главная функция для запуска сервера
 */
async function main() {
  try {
    console.log('Запуск сервера для работы с физическими RFID-картами');
    
    // Попытка подключения к порту по умолчанию
    await connectToPort(DEFAULT_PORT, DEFAULT_BAUDRATE);
    
    // Запуск HTTP сервера
    startServer();
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error.message);
    console.log('Сервер запущен, но без подключения к Arduino. Используйте API для подключения вручную.');
    startServer(); // Запускаем сервер даже при ошибке подключения
  }
}

/**
 * Функция подключения к COM-порту Arduino
 */
async function connectToPort(portPath, baudRate = DEFAULT_BAUDRATE) {
  return new Promise((resolve, reject) => {
    // Если уже подключены, сначала отключаемся
    if (port) {
      port.close((err) => {
        if (err) console.error('Ошибка при закрытии предыдущего порта:', err.message);
        isConnected = false;
      });
    }
    
    console.log(`Подключение к порту ${portPath} со скоростью ${baudRate}...`);
    
    // Создаем новый SerialPort
    port = new SerialPort({ 
      path: portPath, 
      baudRate: baudRate,
      autoOpen: true 
    });
    
    // Настраиваем парсер для построчного чтения данных
    parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    
    // Обработчики событий для порта
    port.on('open', () => {
      console.log(`Порт ${portPath} открыт успешно`);
      isConnected = true;
      resolve();
    });
    
    port.on('error', (err) => {
      console.error('Ошибка порта:', err.message);
      isConnected = false;
      reject(err);
    });
    
    port.on('close', () => {
      console.log('Порт закрыт');
      isConnected = false;
    });
    
    // Обработчик данных от Arduino
    parser.on('data', (data) => {
      console.log('Получены данные:', data);
      
      // Обработка различных сообщений от Arduino
      if (data.startsWith('CARD_DETECTED:')) {
        // Формат: CARD_DETECTED:CARD_ID:CARD_TYPE
        const parts = data.split(':');
        if (parts.length >= 3) {
          lastCardId = parts[1];
          lastCardType = parts[2];
          lastCardTimestamp = new Date().toISOString();
          
          console.log(`Обнаружена карта: ${lastCardId} (${lastCardType})`);
          
          // Если есть активное ожидание чтения карты, завершаем его
          if (readCardResolve) {
            clearTimeout(readCardTimeout);
            readCardResolve({
              cardId: lastCardId,
              cardType: lastCardType,
              timestamp: lastCardTimestamp
            });
            readCardResolve = null;
            readCardPromise = null;
          }
        }
      } 
      else if (data === 'CARD_REMOVED') {
        console.log('Карта убрана');
        // Здесь можно добавить дополнительную логику при удалении карты
      }
      else if (data === 'READER_READY') {
        console.log('Считыватель готов к работе');
      }
      else if (data === 'READER_RESET_COMPLETE') {
        console.log('Считыватель успешно сброшен');
      }
      else if (data.startsWith('READER_STATUS:')) {
        console.log('Получен статус считывателя:', data);
      }
    });
  });
}

/**
 * Запуск HTTP сервера
 */
function startServer() {
  // API для получения статуса сервера
  app.get('/api/status', (req, res) => {
    res.json({
      connected: isConnected,
      port: port ? port.path : null,
      lastCardId,
      lastCardType,
      lastCardTimestamp
    });
  });
  
  // API для подключения к порту
  app.post('/api/connect', async (req, res) => {
    const { portPath, baudRate } = req.body;
    
    if (!portPath) {
      return res.status(400).json({ error: 'Не указан путь к порту' });
    }
    
    try {
      await connectToPort(portPath, baudRate || DEFAULT_BAUDRATE);
      res.json({ success: true, message: `Подключено к порту ${portPath}` });
    } catch (error) {
      res.status(500).json({ error: `Ошибка подключения: ${error.message}` });
    }
  });
  
  // API для отключения от порта
  app.post('/api/disconnect', (req, res) => {
    if (!port || !isConnected) {
      return res.status(400).json({ error: 'Нет активного подключения' });
    }
    
    port.close((err) => {
      if (err) {
        return res.status(500).json({ error: `Ошибка отключения: ${err.message}` });
      }
      
      isConnected = false;
      res.json({ success: true, message: 'Отключено от порта' });
    });
  });
  
  // API для сброса считывателя
  app.post('/api/reset', (req, res) => {
    if (!port || !isConnected) {
      return res.status(400).json({ error: 'Нет активного подключения' });
    }
    
    port.write('RESET\n', (err) => {
      if (err) {
        return res.status(500).json({ error: `Ошибка сброса: ${err.message}` });
      }
      
      res.json({ success: true, message: 'Команда сброса отправлена' });
    });
  });
  
  // API для запроса статуса считывателя
  app.post('/api/reader-status', (req, res) => {
    if (!port || !isConnected) {
      return res.status(400).json({ error: 'Нет активного подключения' });
    }
    
    port.write('STATUS\n', (err) => {
      if (err) {
        return res.status(500).json({ error: `Ошибка запроса статуса: ${err.message}` });
      }
      
      res.json({ success: true, message: 'Запрос статуса отправлен' });
    });
  });
  
  // API для запуска сканирования карт
  app.post('/api/scan', (req, res) => {
    if (!port || !isConnected) {
      return res.status(400).json({ error: 'Нет активного подключения' });
    }
    
    port.write('SCAN\n', (err) => {
      if (err) {
        return res.status(500).json({ error: `Ошибка запуска сканирования: ${err.message}` });
      }
      
      res.json({ success: true, message: 'Команда сканирования отправлена' });
    });
  });
  
  // API для чтения карты с ожиданием
  app.get('/api/read-card', async (req, res) => {
    if (!port || !isConnected) {
      return res.status(400).json({ error: 'Нет активного подключения' });
    }
    
    // Если последняя карта была считана менее 5 секунд назад, возвращаем ее
    const recentCardThreshold = 5000; // 5 секунд
    if (lastCardId && lastCardTimestamp) {
      const timeSinceLastCard = new Date() - new Date(lastCardTimestamp);
      if (timeSinceLastCard < recentCardThreshold) {
        return res.json({
          cardId: lastCardId,
          cardType: lastCardType,
          timestamp: lastCardTimestamp
        });
      }
    }
    
    // Определяем таймаут из параметров запроса или используем значение по умолчанию
    const timeout = parseInt(req.query.timeout) || 30000; // 30 секунд по умолчанию
    
    // Если уже есть активный запрос на чтение карты, возвращаем ошибку
    if (readCardPromise) {
      return res.status(409).json({ error: 'Уже есть активный запрос на чтение карты' });
    }
    
    try {
      // Создаем обещание, которое будет разрешено при считывании карты
      readCardPromise = new Promise((resolve, reject) => {
        readCardResolve = resolve;
        
        // Устанавливаем таймаут
        readCardTimeout = setTimeout(() => {
          readCardResolve = null;
          readCardPromise = null;
          reject(new Error('Таймаут чтения карты'));
        }, timeout);
      });
      
      // Отправляем команду сканирования
      port.write('SCAN\n');
      
      // Ждем выполнения обещания
      const cardData = await readCardPromise;
      res.json(cardData);
    } catch (error) {
      res.status(408).json({ error: error.message });
    }
  });
  
  // API для получения списка доступных портов
  app.get('/api/ports', async (req, res) => {
    try {
      const ports = await SerialPort.list();
      res.json(ports);
    } catch (error) {
      res.status(500).json({ error: `Ошибка получения списка портов: ${error.message}` });
    }
  });
  
  // API для симуляции сканирования карты (для тестирования)
  app.post('/api/simulate-scan', (req, res) => {
    const { cardId = 'SIMULATED123', cardType = 'MIFARE_1K' } = req.body;
    
    lastCardId = cardId;
    lastCardType = cardType;
    lastCardTimestamp = new Date().toISOString();
    
    // Если есть активное ожидание чтения карты, завершаем его
    if (readCardResolve) {
      clearTimeout(readCardTimeout);
      readCardResolve({
        cardId: lastCardId,
        cardType: lastCardType,
        timestamp: lastCardTimestamp
      });
      readCardResolve = null;
      readCardPromise = null;
    }
    
    res.json({ 
      success: true, 
      message: 'Симуляция сканирования выполнена', 
      cardId,
      cardType,
      timestamp: lastCardTimestamp
    });
  });
  
  // Запуск сервера на указанном порту
  app.listen(SERVER_PORT, () => {
    console.log(`Сервер запущен на порту ${SERVER_PORT}`);
    console.log('\nДоступные API-эндпоинты:');
    console.log('  GET  /api/status         - Получение статуса сервера');
    console.log('  POST /api/connect        - Подключение к порту (body: {portPath, baudRate})');
    console.log('  POST /api/disconnect     - Отключение от порта');
    console.log('  POST /api/reset          - Сброс считывателя');
    console.log('  POST /api/reader-status  - Запрос статуса считывателя');
    console.log('  POST /api/scan           - Запуск сканирования карт');
    console.log('  GET  /api/read-card      - Чтение карты с ожиданием (query: timeout)');
    console.log('  GET  /api/ports          - Получение списка доступных портов');
    console.log('  POST /api/simulate-scan  - Симуляция сканирования (для тестирования)');
  });
}

// Запуск главной функции
main().catch(error => {
  console.error('Критическая ошибка при запуске сервера:', error);
  process.exit(1);
}); 