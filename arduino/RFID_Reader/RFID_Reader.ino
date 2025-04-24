/*
 * RFID Card Reader
 * 
 * This sketch reads RFID cards using the RC522 module and sends the card ID
 * to the connected computer via the serial port in JSON format.
 * 
 * Connections:
 * RC522      Arduino
 * -----------------
 * SDA(SS)    10
 * SCK        13
 * MOSI       11
 * MISO       12
 * IRQ        Not connected
 * GND        GND
 * RST        9
 * 3.3V       3.3V
 */

#include <SPI.h>
#include <MFRC522.h>

// Pin definitions
#define SS_PIN 10
#define RST_PIN 9
#define LED_RED_PIN 7     // Error LED
#define LED_GREEN_PIN 6   // Success LED
#define BUZZER_PIN 5      // Buzzer for audio feedback

// RFID reader
MFRC522 rfid(SS_PIN, RST_PIN);

// Constants
const unsigned long SCAN_INTERVAL = 500;      // Minimum time between card scans (ms)
const unsigned long READ_TIMEOUT = 3000;      // Timeout for card reading operation (ms)
const unsigned long STATUS_INTERVAL = 5000;   // Status message interval (ms)

// Variables
unsigned long lastCardTime = 0;         // Last time a card was detected
unsigned long lastStatusTime = 0;        // Last time status was sent
String lastCardId = "";                 // Last read card ID
bool isInitialized = false;             // Initialization status

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize digital pins
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initialize SPI bus
  SPI.begin();
  
  // Initialize RFID reader
  rfid.PCD_Init();
  
  // Check if RFID reader is working
  byte version = rfid.PCD_ReadRegister(MFRC522::VersionReg);
  
  if (version == 0x00 || version == 0xFF) {
    isInitialized = false;
    sendStatusMessage("error", "RFID reader initialization failed");
    errorFeedback();
  } else {
    isInitialized = true;
    sendStatusMessage("ready", "RFID reader initialized successfully");
    successFeedback();
  }
  
  // Set the gain to max
  rfid.PCD_SetAntennaGain(MFRC522::RxGain_max);
}

void loop() {
  unsigned long currentTime = millis();
  
  // Send periodic status messages
  if (currentTime - lastStatusTime >= STATUS_INTERVAL) {
    lastStatusTime = currentTime;
    if (isInitialized) {
      sendStatusMessage("ready", "Waiting for card");
    } else {
      // Try to reinitialize if it failed before
      rfid.PCD_Init();
      byte version = rfid.PCD_ReadRegister(MFRC522::VersionReg);
      
      if (version != 0x00 && version != 0xFF) {
        isInitialized = true;
        sendStatusMessage("ready", "RFID reader initialized successfully");
        successFeedback();
      } else {
        sendStatusMessage("error", "RFID reader not responding");
      }
    }
  }
  
  // Check if reader is initialized
  if (!isInitialized) {
    return;
  }
  
  // Check for new cards
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }
  
  // Only read card if enough time has passed since last read
  if (currentTime - lastCardTime < SCAN_INTERVAL) {
    return;
  }
  
  // Read card serial number
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  // Get card ID as a string
  String cardId = getCardIdString();
  
  // Update timing information
  lastCardTime = currentTime;
  
  // Process the card read
  processCardRead(cardId);
  
  // Stop PICC and end encryption
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// Process a card read and send the data
void processCardRead(String cardId) {
  // Check if this is the same card as last time
  if (cardId == lastCardId) {
    // Same card, provide minimal feedback
    shortBeep();
  } else {
    // New card detected
    lastCardId = cardId;
    
    // Send card data
    sendCardData(cardId);
    
    // Provide success feedback
    successFeedback();
  }
}

// Convert the card ID to a hex string
String getCardIdString() {
  String cardId = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    // Add leading zero for single-digit hex values
    if (rfid.uid.uidByte[i] < 0x10) {
      cardId += "0";
    }
    // Convert byte to hex string
    cardId += String(rfid.uid.uidByte[i], HEX);
  }
  cardId.toUpperCase();
  return cardId;
}

// Send card data as JSON
void sendCardData(String cardId) {
  Serial.print("{\"type\":\"card_read\",\"card_id\":\"");
  Serial.print(cardId);
  Serial.print("\",\"timestamp\":");
  Serial.print(millis());
  Serial.println("}");
}

// Send status message as JSON
void sendStatusMessage(String status, String message) {
  Serial.print("{\"type\":\"status\",\"status\":\"");
  Serial.print(status);
  Serial.print("\",\"message\":\"");
  Serial.print(message);
  Serial.print("\",\"timestamp\":");
  Serial.print(millis());
  Serial.println("}");
}

// Process commands from serial port
void processSerialCommands() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "status") {
      if (isInitialized) {
        sendStatusMessage("ready", "RFID reader is operational");
      } else {
        sendStatusMessage("error", "RFID reader not initialized");
      }
    }
    else if (command == "reset") {
      rfid.PCD_Reset();
      rfid.PCD_Init();
      byte version = rfid.PCD_ReadRegister(MFRC522::VersionReg);
      
      if (version != 0x00 && version != 0xFF) {
        isInitialized = true;
        sendStatusMessage("ready", "RFID reader reset successfully");
        successFeedback();
      } else {
        isInitialized = false;
        sendStatusMessage("error", "RFID reader reset failed");
        errorFeedback();
      }
    }
    else if (command.startsWith("beep")) {
      int duration = 200; // Default duration
      
      // Check if duration is specified (beep:500)
      int colonIndex = command.indexOf(':');
      if (colonIndex != -1) {
        String durationStr = command.substring(colonIndex + 1);
        duration = durationStr.toInt();
        if (duration <= 0 || duration > 5000) {
          duration = 200; // Reset to default if invalid
        }
      }
      
      // Trigger beep
      tone(BUZZER_PIN, 2000, duration);
    }
  }
}

// Sound and light feedback for successful scan
void successFeedback() {
  digitalWrite(LED_GREEN_PIN, HIGH);
  tone(BUZZER_PIN, 2000, 200);
  delay(200);
  digitalWrite(LED_GREEN_PIN, LOW);
}

// Sound and light feedback for error
void errorFeedback() {
  digitalWrite(LED_RED_PIN, HIGH);
  
  // Two short beeps for error
  tone(BUZZER_PIN, 1000, 100);
  delay(100);
  tone(BUZZER_PIN, 1000, 100);
  
  delay(200);
  digitalWrite(LED_RED_PIN, LOW);
}

// Short beep for minor notifications
void shortBeep() {
  tone(BUZZER_PIN, 2000, 50);
} 