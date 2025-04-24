/**
 * Программа для Arduino с RFID-считывателем WG26 через UART
 * Отправляет ID карты в JSON формате через Serial порт
 * Поддерживает команды для управления считывателем
 */

#include <SoftwareSerial.h>

#define LED_PIN LED_BUILTIN
#define RX_PIN D2  // Пин для приема данных от считывателя WG26
#define TX_PIN D3  // Пин для передачи (не используется активно в WG26)

// Настройка SoftwareSerial для WG26
SoftwareSerial wg26Serial(RX_PIN, TX_PIN); // RX, TX

// Буфер для накопления данных
uint8_t dataBuffer[20];
int bufferIndex = 0;

// Информация о последней считанной карте
String lastCardId = "";
String lastCardType = "";
unsigned long lastScanTime = 0;
const int scanInterval = 3000; // Минимальный интервал между сканированиями (мс)
bool debugMode = true;

void setup() {
  // Инициализация Serial для коммуникации с сервером
  Serial.begin(9600);
  
  // Инициализация SoftwareSerial для WG26
  wg26Serial.begin(9600);
  
  // Настройка светодиода
  pinMode(LED_PIN, OUTPUT);
  
  // Мигаем светодиодом для индикации готовности
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  // Отправка информации о готовности
  Serial.println("{\"type\":\"status\",\"status\":\"ready\",\"message\":\"WG26 RFID reader initialized\"}");
}

void loop() {
  // Проверка команд от сервера
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    processCommand(command);
  }
  
  // Чтение данных в буфер
  while (wg26Serial.available()) {
    uint8_t incomingByte = wg26Serial.read();

    // Обработка переполнения буфера
    if (bufferIndex >= 20) {
      bufferIndex = 0;
      if (debugMode) {
        Serial.println("Buffer overflow! Reset buffer");
      }
    }

    dataBuffer[bufferIndex] = incomingByte;
    bufferIndex++;

    // Обработка пакета при получении завершающего байта
    if (incomingByte == 0x03) {
      processData(dataBuffer, bufferIndex);
      bufferIndex = 0;
    }
  }
  
  delay(10); // Небольшая задержка для стабильности
}

// Обработка полученных данных с считывателя
void processData(uint8_t* data, int length) {
  // Проверка минимальной длины пакета
  if (length < 4) {
    if (debugMode) {
      Serial.println("Invalid Packet Length");
    }
    return;
  }

  // Проверка стартового и стопового байтов
  if (data[0] != 0x02 || data[length - 1] != 0x03) {
    if (debugMode) {
      Serial.println("Invalid Packet Format");
    }
    return;
  }

  // Вывод сырых данных при включенном режиме отладки
  if (debugMode) {
    Serial.print("Raw Data: ");
    for (int i = 0; i < length; i++) {
      Serial.printf("%02X ", data[i]);
    }
    Serial.println();
  }

  // Проверка длины пакета
  uint8_t packetLength = data[1];
  if (packetLength != length) {
    if (debugMode) {
      Serial.println("Packet Length Mismatch");
    }
    return;
  }

  // Определение типа карты
  String cardType = getCardTypeName(data[2]);
  if (debugMode) {
    Serial.print("Card Type: ");
    Serial.println(cardType);
  }

  // Извлечение номера карты
  String cardID = "";
  for (int i = 3; i < length - 2; i++) {
    char hexByte[3];
    sprintf(hexByte, "%02X", data[i]);
    cardID += hexByte;
  }

  if (debugMode) {
    Serial.print("Card Number: ");
    Serial.println(cardID);
  }

  // Проверка контрольной суммы
  uint8_t bcc = data[length - 2];
  uint8_t calcBcc = 0;
  for (int i = 1; i < length - 2; i++) {
    calcBcc ^= data[i];
  }

  bool checksumValid = (bcc == calcBcc);
  if (debugMode) {
    Serial.println(checksumValid ? "BCC Check: OK" : "BCC Check: FAIL");
  }

  // Если контрольная сумма верна, обрабатываем карту
  if (checksumValid) {
    // Получаем текущее время
    unsigned long currentTime = millis();
    
    // Проверяем, не та же ли карта за короткий промежуток времени
    if (cardID != lastCardId || (currentTime - lastScanTime > scanInterval)) {
      // Сохраняем информацию о карте
      lastCardId = cardID;
      lastCardType = cardType;
      lastScanTime = currentTime;
      
      // Мигаем светодиодом для индикации успешного считывания
      digitalWrite(LED_PIN, HIGH);
      
      // Отправляем данные в формате JSON
      Serial.print("{\"type\":\"card_read\",\"card_id\":\"");
      Serial.print(cardID);
      Serial.print("\",\"card_type\":\"");
      Serial.print(cardType);
      Serial.print("\",\"timestamp\":");
      Serial.print(currentTime);
      Serial.println("}");
      
      // Также выводим информацию в более читаемом формате
      Serial.print("Card Type: ");
      Serial.println(cardType);
      Serial.print("Card UID: ");
      Serial.println(cardID);
      
      delay(200);
      digitalWrite(LED_PIN, LOW);
    }
  }
}

// Получение названия типа карты по коду
String getCardTypeName(uint8_t cardTypeCode) {
  switch (cardTypeCode) {
    case 0x01: return "MIFARE 1K";
    case 0x02: return "EM4100";
    case 0x03: return "MIFARE 4K";
    case 0x10: return "HID Card";
    case 0x11: return "T5567";
    case 0x20: return "2nd Card";
    case 0x21: return "ISO14443B";
    case 0x22: return "FELICA";
    case 0x30: return "15693 Label";
    case 0x50: return "CPU Card";
    case 0x51: return "Sector Information";
    case 0xFF: return "Keyboard Data";
    default:   return "Unknown";
  }
}

// Конвертация массива байтов в строку в HEX формате
String bytesToHexString(uint8_t* data, int start, int length) {
  String result = "";
  for (int i = start; i < start + length; i++) {
    if (data[i] < 0x10) {
      result += "0";
    }
    result += String(data[i], HEX);
  }
  result.toUpperCase();
  return result;
}

// Обработка команд от сервера
void processCommand(String command) {
  command.trim();
  
  if (debugMode) {
    Serial.print("Command received: ");
    Serial.println(command);
  }
  
  // Команда для получения последней считанной карты
  if (command == "g" || command == "get") {
    if (lastCardId.length() > 0) {
      // Выводим информацию о типе карты
      Serial.print("Card Type: ");
      Serial.println(lastCardType);
      
      // Выводим UID карты в чистом виде
      Serial.print("Card UID: ");
      Serial.println(lastCardId);
      
      // Также отправляем в JSON формате
      Serial.print("{\"type\":\"card_read\",\"card_id\":\"");
      Serial.print(lastCardId);
      Serial.print("\",\"card_type\":\"");
      Serial.print(lastCardType);
      Serial.print("\",\"timestamp\":");
      Serial.print(millis());
      Serial.println("}");
      
      // Мигаем для индикации
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
    } else {
      Serial.println("{\"type\":\"status\",\"status\":\"error\",\"message\":\"No card has been read yet\"}");
    }
  }
  // Команда для сброса считывателя (в данном случае - только очистка буфера)
  else if (command == "reset") {
    bufferIndex = 0;
    Serial.println("{\"type\":\"status\",\"status\":\"ready\",\"message\":\"Reader reset complete\"}");
    
    // Мигаем для индикации
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
  }
  // Команда для получения статуса
  else if (command == "status") {
    Serial.println("{\"type\":\"status\",\"status\":\"ready\",\"message\":\"Reader is operational\"}");
  }
  // Команда для включения/выключения режима отладки
  else if (command == "debug on") {
    debugMode = true;
    Serial.println("{\"type\":\"status\",\"status\":\"ok\",\"message\":\"Debug mode enabled\"}");
  }
  else if (command == "debug off") {
    debugMode = false;
    Serial.println("{\"type\":\"status\",\"status\":\"ok\",\"message\":\"Debug mode disabled\"}");
  }
  // Неизвестная команда
  else if (command.length() > 0) {
    if (debugMode) {
      Serial.print("{\"type\":\"status\",\"status\":\"error\",\"message\":\"Unknown command: ");
      Serial.print(command);
      Serial.println("\"}");
    }
  }
} 