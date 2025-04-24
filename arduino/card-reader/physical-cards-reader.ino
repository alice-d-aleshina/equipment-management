/**
 * ===================================
 * Simplified RFID Card Reader
 * ===================================
 * Оптимизированный скетч для надежного чтения физических RFID карт
 * Совместим с модулями RFID-RC522 на частоте 13.56 МГц
 *
 * Автор: Claude AI Assistant, 2023
 * Версия: 1.0
 *
 * Подключение RFID-RC522:
 * RST         - 9
 * SDA(SS)     - 10
 * MOSI        - 11
 * MISO        - 12
 * SCK         - 13
 * GND         - GND
 * 3.3V        - 3.3V
 *
 * Светодиод (опционально):
 * LED         - 7
 */

#include <SPI.h>
#include <MFRC522.h>

// Пины
#define RST_PIN         9
#define SS_PIN          10
#define LED_PIN         7

// Настройки
#define SERIAL_SPEED    9600  // Скорость Serial порта
#define OUTPUT_FORMAT   1     // 1 = простой текст, 2 = JSON, 3 = оба формата

// Экземпляры
MFRC522 mfrc522(SS_PIN, RST_PIN);  // Создание экземпляра MFRC522
MFRC522::MIFARE_Key key;

// Глобальные переменные
char receivedCommand[20];   // Буфер для команды
int commandIndex = 0;       // Индекс буфера команды
bool cardWasPresent = false;  // Флаг наличия карты

/**
 * Настройка при запуске
 */
void setup() {
  // Инициализация Serial
  Serial.begin(SERIAL_SPEED);
  
  // Инициализация пинов
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Инициализация SPI
  SPI.begin();
  
  // Инициализация RFID
  mfrc522.PCD_Init();
  
  // Повышаем усиление антенны для лучшего чтения
  mfrc522.PCD_SetAntennaGain(MFRC522::PCD_RxGain_max);
  
  // Сброс ключа
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  
  // Информация о запуске
  delay(500); // Пауза для стабилизации
  Serial.println("READER_READY");
}

/**
 * Основной цикл
 */
void loop() {
  // Обработка команд от сервера
  processSerialCommands();
  
  // Проверка наличия карты
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    // Карта обнаружена, включаем LED
    digitalWrite(LED_PIN, HIGH);
    
    // Получаем тип карты
    String cardType = getCardType();
    
    // Получаем UID карты как строку
    String uid = getCardUID();
    
    // Отправляем данные в последовательный порт
    sendCardData(uid, cardType);
    
    // Устанавливаем флаг наличия карты
    cardWasPresent = true;
    
    // Ждем некоторое время перед следующим чтением
    delay(500);
    
    // Останавливаем PICC и завершаем аутентификацию
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
  } 
  else {
    // Если карта была и исчезла
    if (cardWasPresent) {
      cardWasPresent = false;
      digitalWrite(LED_PIN, LOW);
      Serial.println("CARD_REMOVED");
    }
    
    // Короткая пауза
    delay(100);
  }
}

/**
 * Обработка команд из последовательного порта
 */
void processSerialCommands() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    
    // Конец команды
    if (c == '\n' || c == '\r') {
      if (commandIndex > 0) {
        receivedCommand[commandIndex] = '\0';
        executeCommand(receivedCommand);
        commandIndex = 0;
      }
    } 
    // Добавляем символ к команде
    else if (commandIndex < sizeof(receivedCommand) - 1) {
      receivedCommand[commandIndex++] = c;
    }
  }
}

/**
 * Выполнение полученной команды
 */
void executeCommand(const char* command) {
  if (strcmp(command, "SCAN") == 0) {
    // Активное сканирование (на самом деле просто сообщаем, что начали)
    Serial.println("SCANNING");
  }
  else if (strcmp(command, "STATUS") == 0) {
    // Отправка статуса
    Serial.println("READER_STATUS:READY");
  }
  else if (strcmp(command, "RESET") == 0) {
    // Сброс считывателя
    resetReader();
    Serial.println("READER_RESET_COMPLETE");
  }
  else if (strcmp(command, "VERSION") == 0) {
    // Отправка версии
    Serial.println("VERSION:1.0:PHYSICAL_CARDS_READER");
  }
}

/**
 * Сброс считывателя
 */
void resetReader() {
  // Сброс MFRC522
  mfrc522.PCD_Reset();
  delay(50);
  
  // Реинициализация
  mfrc522.PCD_Init();
  
  // Устанавливаем максимальное усиление
  mfrc522.PCD_SetAntennaGain(MFRC522::PCD_RxGain_max);
  
  // Выключаем LED
  digitalWrite(LED_PIN, LOW);
  
  // Сбрасываем флаг карты
  cardWasPresent = false;
}

/**
 * Получение типа карты в виде строки
 */
String getCardType() {
  MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
  String typeText;
  
  switch (piccType) {
    case MFRC522::PICC_TYPE_ISO_14443_4:
      typeText = "ISO_14443_4";
      break;
    case MFRC522::PICC_TYPE_ISO_18092:
      typeText = "ISO_18092";
      break;
    case MFRC522::PICC_TYPE_MIFARE_MINI:
      typeText = "MIFARE_MINI";
      break;
    case MFRC522::PICC_TYPE_MIFARE_1K:
      typeText = "MIFARE_1K";
      break;
    case MFRC522::PICC_TYPE_MIFARE_4K:
      typeText = "MIFARE_4K";
      break;
    case MFRC522::PICC_TYPE_MIFARE_UL:
      typeText = "MIFARE_UL";
      break;
    case MFRC522::PICC_TYPE_MIFARE_PLUS:
      typeText = "MIFARE_PLUS";
      break;
    case MFRC522::PICC_TYPE_TNP3XXX:
      typeText = "TNP3XXX";
      break;
    case MFRC522::PICC_TYPE_NOT_COMPLETE:
      typeText = "NOT_COMPLETE";
      break;
    default:
      typeText = "UNKNOWN";
  }
  
  return typeText;
}

/**
 * Получение UID карты в виде строки
 */
String getCardUID() {
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) {
      uid += "0";
    }
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

/**
 * Отправка данных карты в последовательный порт
 */
void sendCardData(String uid, String cardType) {
  // Простой текстовый формат
  if (OUTPUT_FORMAT == 1 || OUTPUT_FORMAT == 3) {
    Serial.print("Card UID: ");
    Serial.println(uid);
    Serial.print("Card type: ");
    Serial.println(cardType);
  }
  
  // JSON формат
  if (OUTPUT_FORMAT == 2 || OUTPUT_FORMAT == 3) {
    Serial.print("{\"type\":\"card_read\",\"card_id\":\"");
    Serial.print(uid);
    Serial.print("\",\"card_type\":\"");
    Serial.print(cardType);
    Serial.println("\"}");
  }
  
  // Специальный формат для сервера
  Serial.print("CARD_DETECTED:");
  Serial.print(uid);
  Serial.print(":");
  Serial.println(cardType);
} 