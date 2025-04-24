/**
 * Equipment Management System - RFID Card Reader
 * 
 * This Arduino sketch interfaces with an MFRC522 RFID module to read RFID cards
 * and communicates with the equipment management system via serial port.
 * Поддерживает как считывание телефонов, так и физических карт.
 * 
 * Hardware:
 * - Arduino Nano/Uno/NodeMCU
 * - MFRC522 RFID module connected via SPI
 * - Optional: Status LED
 * 
 * Libraries needed:
 * - MFRC522
 * - ArduinoJson
 */

#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

// Pin configuration
#define RST_PIN         9          // Reset pin for MFRC522
#define SS_PIN          10         // Slave Select pin for MFRC522
#define STATUS_LED_PIN  2          // Status LED pin

// MFRC522 instance
MFRC522 rfid(SS_PIN, RST_PIN);

// Constants
#define FIRMWARE_VERSION "1.1.0"   // Firmware version
#define JSON_BUFFER_SIZE 256       // Size of JSON buffer for communication

// Variables for card tracking
byte lastReadCardUID[10] = {0};     // Last read card UID
bool cardPresent = false;           // Card currently present
unsigned long cardPresentTime = 0;  // Time when card was detected
unsigned long lastStatusTime = 0;   // Time of last status message
unsigned long startTime = 0;        // Boot time
unsigned long lastScanAdjustTime = 0; // Time when scan mode was last adjusted
bool enhancedScanMode = true;       // Enhanced scan mode for better detection
int currentGain = 0;                // Current antenna gain level

// Serial communication
String inputBuffer = "";            // Buffer for incoming commands
bool commandComplete = false;       // Flag for command completion

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for serial port to connect
  }
  
  // Initialize SPI bus and MFRC522
  SPI.begin();
  rfid.PCD_Init();
  
  // Расширенная инициализация для повышения чувствительности
  rfid.PCD_Reset();
  delay(50);
  rfid.PCD_Init();
  
  // Set antenna gain to maximum for initial scan
  rfid.PCD_SetAntennaGain(rfid.RxGain_max);
  currentGain = rfid.RxGain_max;
  
  // Важные настройки для повышения дальности считывания
  // Регистр RxGain управляет усилением приёмника
  rfid.PCD_WriteRegister(rfid.RFCfgReg, (0x07<<4)); // Усиление RF 48 дБ
  
  // Initialize status LED
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);
  
  // Record start time
  startTime = millis();
  
  // Send startup message
  sendStatus("Reader initialized with enhanced scan mode");
  
  // Blink LED to indicate successful initialization
  blinkLED(3, 200);
}

void loop() {
  // Check for incoming commands
  processSerialCommands();
  
  // Periodically send status (every 30 seconds)
  if (millis() - lastStatusTime > 30000) {
    sendStatus("Alive");
    lastStatusTime = millis();
  }
  
  // Периодически меняем усиление антенны для лучшего считывания разных типов карт
  // Это помогает обнаруживать как телефоны, так и физические карты
  if (enhancedScanMode && (millis() - lastScanAdjustTime > 3000)) {
    cycleAntennaGain();
    lastScanAdjustTime = millis();
  }
  
  // Дополнительная проверка для улучшения обнаружения карт
  bool cardDetected = false;
  
  // Два метода обнаружения карты для большей надежности
  if (rfid.PICC_IsNewCardPresent()) {
    cardDetected = rfid.PICC_ReadCardSerial();
  }
  
  // Если карта не обнаружена первым методом, пробуем альтернативный
  if (!cardDetected) {
    if (rfid.PICC_RequestA(rfid.PICC_CMD_REQA, rfid.uid.uidByte, &rfid.uid.size)) {
      cardDetected = rfid.PICC_Select(&rfid.uid);
    }
  }
  
  // Обработка обнаруженной карты
  if (cardDetected) {
    handleCardPresent();
  } 
  // Check if card was removed
  else if (cardPresent && !isCardStillPresent()) {
    handleCardRemoved();
  }
  
  // Small delay to prevent CPU hogging
  delay(20); // Уменьшен интервал для более быстрого реагирования
}

/**
 * Cycle through different antenna gain settings for better card detection
 */
void cycleAntennaGain() {
  // Cycle through different gain settings
  switch (currentGain) {
    case MFRC522::RxGain_max:
      currentGain = MFRC522::RxGain_avg;
      break;
    case MFRC522::RxGain_avg:
      currentGain = MFRC522::RxGain_min;
      break;
    case MFRC522::RxGain_min:
    default:
      currentGain = MFRC522::RxGain_max;
      break;
  }
  
  rfid.PCD_SetAntennaGain(currentGain);
  
  // Каждый раз при изменении усиления, пытаемся активировать поле для обнаружения карт
  byte buffer[2];
  byte bufferSize = sizeof(buffer);
  
  // Отправка REQA для обнаружения новых карт
  rfid.PICC_WakeupA(buffer, &bufferSize);
  
  // Индикация изменения режима сканирования коротким миганием
  digitalWrite(STATUS_LED_PIN, HIGH);
  delay(10);
  digitalWrite(STATUS_LED_PIN, LOW);
}

/**
 * Process commands received from the serial port
 */
void processSerialCommands() {
  // Read serial input
  while (Serial.available() > 0 && !commandComplete) {
    char inChar = (char)Serial.read();
    
    // Process command when newline received
    if (inChar == '\n') {
      commandComplete = true;
    } else {
      inputBuffer += inChar;
    }
  }
  
  // If we have a complete command, process it
  if (commandComplete) {
    StaticJsonDocument<JSON_BUFFER_SIZE> doc;
    DeserializationError error = deserializeJson(doc, inputBuffer);
    
    if (!error) {
      // Extract command
      const char* command = doc["cmd"];
      
      // Process command
      if (strcmp(command, "status") == 0) {
        sendStatus("Status request");
      } 
      else if (strcmp(command, "reset") == 0) {
        resetReader();
      }
      else if (strcmp(command, "scan") == 0) {
        // Turn on enhanced scan mode
        enhancedScanMode = true;
        rfid.PCD_SetAntennaGain(rfid.RxGain_max);
        currentGain = rfid.RxGain_max;
        sendStatus("Enhanced scan mode activated");
      }
      else if (strcmp(command, "standard") == 0) {
        // Turn off enhanced scan mode
        enhancedScanMode = false;
        rfid.PCD_SetAntennaGain(rfid.RxGain_max);
        currentGain = rfid.RxGain_max;
        sendStatus("Standard scan mode activated");
      }
    } else {
      // Send error if JSON parsing failed
      sendError("Invalid JSON command");
    }
    
    // Clear buffer for next command
    inputBuffer = "";
    commandComplete = false;
  }
}

/**
 * Send status message to the host
 */
void sendStatus(const char* message) {
  StaticJsonDocument<JSON_BUFFER_SIZE> doc;
  
  doc["type"] = "status";
  doc["message"] = message;
  doc["firmware"] = FIRMWARE_VERSION;
  doc["uptime"] = millis() / 1000; // Uptime in seconds
  
  // Add reader diagnostics
  doc["antenna_gain"] = currentGain;
  doc["enhanced_mode"] = enhancedScanMode;
  doc["communication_status"] = rfid.PCD_GetAntennaGain() != 0;
  
  // Send the JSON string
  serializeJson(doc, Serial);
  Serial.println();
  
  lastStatusTime = millis();
}

/**
 * Reset the RFID reader
 */
void resetReader() {
  // Reset the MFRC522
  rfid.PCD_Reset();
  delay(50);
  rfid.PCD_Init();
  
  // Set maximum antenna gain
  rfid.PCD_SetAntennaGain(rfid.RxGain_max);
  currentGain = rfid.RxGain_max;
  
  // Дополнительная настройка для усиления чувствительности
  rfid.PCD_WriteRegister(rfid.RFCfgReg, (0x07<<4));
  
  // Reset variables
  cardPresent = false;
  
  // Send status
  sendStatus("Reader reset complete");
  
  // Visual indicator
  blinkLED(2, 250);
}

/**
 * Send error message to the host
 */
void sendError(const char* errorMessage) {
  StaticJsonDocument<JSON_BUFFER_SIZE> doc;
  
  doc["type"] = "error";
  doc["message"] = errorMessage;
  
  // Send the JSON string
  serializeJson(doc, Serial);
  Serial.println();
  
  // Indicate error with LED
  blinkLED(5, 100);
}

/**
 * Handle a new card being presented
 */
void handleCardPresent() {
  // Card is now present
  cardPresent = true;
  cardPresentTime = millis();
  
  // Read the UID
  for (byte i = 0; i < rfid.uid.size && i < 10; i++) {
    lastReadCardUID[i] = rfid.uid.uidByte[i];
  }
  
  // Send card data to host
  StaticJsonDocument<JSON_BUFFER_SIZE> doc;
  
  doc["type"] = "card_present";
  
  // Format UID as hex string
  char uidString[32] = {0};
  for (byte i = 0; i < rfid.uid.size; i++) {
    sprintf(uidString + (i * 2), "%02X", rfid.uid.uidByte[i]);
  }
  
  doc["card_id"] = uidString;
  doc["card_type"] = translateCardType(rfid.uid.sak);
  doc["timestamp"] = millis();
  doc["antenna_gain"] = currentGain;
  
  // Определить тип карты более подробно
  String detailedType = getDetailedCardType();
  doc["detailed_type"] = detailedType;
  
  // Send the JSON string
  serializeJson(doc, Serial);
  Serial.println();
  
  // Сохраняем текущее усиление, если карта была успешно считана
  if (enhancedScanMode) {
    // Остаемся на текущем усилении, которое позволило считать карту
    lastScanAdjustTime = millis(); // Сбрасываем таймер цикла усиления
  }
  
  // Indicate card read with LED
  digitalWrite(STATUS_LED_PIN, HIGH);
  
  // Halt PICC and stop encryption
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

/**
 * Get detailed card type information
 */
String getDetailedCardType() {
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  String result = "";
  
  switch (piccType) {
    case MFRC522::PICC_TYPE_ISO_14443_4:
      result = "ISO/IEC 14443-4";
      break;
    case MFRC522::PICC_TYPE_ISO_18092:
      result = "ISO/IEC 18092 (NFC)";
      break;
    case MFRC522::PICC_TYPE_MIFARE_MINI:
      result = "MIFARE Mini";
      break;
    case MFRC522::PICC_TYPE_MIFARE_1K:
      result = "MIFARE Classic 1K";
      break;
    case MFRC522::PICC_TYPE_MIFARE_4K:
      result = "MIFARE Classic 4K";
      break;
    case MFRC522::PICC_TYPE_MIFARE_UL:
      result = "MIFARE Ultralight";
      break;
    case MFRC522::PICC_TYPE_MIFARE_PLUS:
      result = "MIFARE Plus";
      break;
    case MFRC522::PICC_TYPE_MIFARE_DESFIRE:
      result = "MIFARE DESFire";
      break;
    case MFRC522::PICC_TYPE_TNP3XXX:
      result = "MIFARE TNP3XXX";
      break;
    case MFRC522::PICC_TYPE_NOT_COMPLETE:
      result = "Incomplete Detection";
      break;
    default:
      // Смартфоны часто определяются как неизвестный тип
      if (rfid.uid.size == 4 || rfid.uid.size == 7) {
        result = "NFC Device (possibly smartphone)";
      } else {
        result = "Unknown Type";
      }
      break;
  }
  
  return result;
}

/**
 * Handle card being removed
 */
void handleCardRemoved() {
  // Card is no longer present
  cardPresent = false;
  
  // Send card removed message
  StaticJsonDocument<JSON_BUFFER_SIZE> doc;
  
  doc["type"] = "card_removed";
  doc["timestamp"] = millis();
  
  // Send the JSON string
  serializeJson(doc, Serial);
  Serial.println();
  
  // Turn off LED
  digitalWrite(STATUS_LED_PIN, LOW);
}

/**
 * Check if the previously detected card is still present
 */
bool isCardStillPresent() {
  // If no card was previously detected, it's not present
  if (!cardPresent) {
    return false;
  }
  
  // If card was just detected, give it some time before checking again
  if (millis() - cardPresentTime < 500) {
    return true;
  }
  
  // Check if card is still present
  return rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial();
}

/**
 * Blink the status LED
 */
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(delayMs);
  }
}

/**
 * Translate the SAK (Select Acknowledge) value to a card type string
 */
String translateCardType(byte sak) {
  // Reference: https://www.nxp.com/docs/en/application-note/AN10834.pdf
  
  // Check for MIFARE Classic
  if ((sak & 0x08) != 0) {
    return "MIFARE Classic";
  }
  
  // Check for MIFARE Mini
  if ((sak & 0x09) != 0) {
    return "MIFARE Mini";
  }
  
  // Check for MIFARE 1K
  if ((sak & 0x01) != 0) {
    return "MIFARE 1K";
  }
  
  // Check for MIFARE 4K
  if ((sak & 0x02) != 0) {
    return "MIFARE 4K";
  }
  
  // Check for MIFARE Ultralight
  if ((sak & 0x04) != 0) {
    return "MIFARE Ultralight";
  }
  
  // Default unknown type
  return "Unknown";
} 