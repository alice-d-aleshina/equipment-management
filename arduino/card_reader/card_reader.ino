/**
 * Equipment Management - RFID Card Reader
 * 
 * This sketch interfaces an RFID-RC522 module with a computer system
 * via serial communication to provide card reading functionality.
 * 
 * Hardware:
 * - Arduino (Uno, Nano, Mega, etc.)
 * - RFID-RC522 module
 * 
 * Wiring:
 * - RFID-RC522 SDA/SS -> Arduino 10
 * - RFID-RC522 SCK -> Arduino 13
 * - RFID-RC522 MOSI -> Arduino 11
 * - RFID-RC522 MISO -> Arduino 12
 * - RFID-RC522 GND -> Arduino GND
 * - RFID-RC522 RST -> Arduino 9
 * - RFID-RC522 3.3V -> Arduino 3.3V
 * 
 * Library Dependencies:
 * - MFRC522: https://github.com/miguelbalboa/rfid
 */

#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

// Pin configuration for RFID reader
#define SS_PIN 10
#define RST_PIN 9

// LED indicators
#define LED_RED 7    // Error or disconnected
#define LED_GREEN 6  // Card read success
#define LED_BLUE 5   // Ready/standby

// Buzzer for audio feedback
#define BUZZER_PIN 8

// Initialize RFID reader
MFRC522 rfid(SS_PIN, RST_PIN);

// Variables for card reading
byte lastReadCard[4] = {0, 0, 0, 0};  // Last read card UID
unsigned long lastReadTime = 0;       // Timestamp of last read
const unsigned long DEBOUNCE_TIME = 2000; // 2 seconds between reads

// Variables for status reporting
unsigned long lastStatusTime = 0;
const unsigned long STATUS_INTERVAL = 5000; // 5 seconds between status updates

// Serial communication buffer
char inputBuffer[128];
int bufferIndex = 0;

// Setup function - runs once at startup
void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  while (!Serial) {
    ; // Wait for serial port to connect
  }
  
  // Initialize SPI bus
  SPI.begin();
  
  // Initialize RFID reader
  rfid.PCD_Init();
  
  // Set LED pins as outputs
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initial LED state - blue on (ready)
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_BLUE, HIGH);
  
  // Send startup message
  sendStatus("init", "Card reader initialized");
}

// Main loop - runs repeatedly
void loop() {
  // Check for serial commands
  checkSerialCommands();
  
  // Check for card presence
  checkCardPresence();
  
  // Send periodic status update
  sendPeriodicStatus();
}

// Check for commands from the serial port
void checkSerialCommands() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    
    // Process command on newline
    if (c == '\n') {
      inputBuffer[bufferIndex] = 0; // Null terminate
      processCommand(inputBuffer);
      bufferIndex = 0; // Reset buffer
    } 
    // Add character to buffer if not full
    else if (bufferIndex < sizeof(inputBuffer) - 1) {
      inputBuffer[bufferIndex++] = c;
    }
  }
}

// Process a command received via serial
void processCommand(char* command) {
  // Create JSON document for response
  StaticJsonDocument<200> doc;
  
  // Parse incoming command as JSON
  DeserializationError error = deserializeJson(doc, command);
  
  if (error) {
    // If not valid JSON, check for simple commands
    if (strcmp(command, "status") == 0) {
      sendStatus("status", "OK");
    } 
    else if (strcmp(command, "reset") == 0) {
      resetReader();
      sendStatus("reset", "Reader reset");
    }
    else if (strcmp(command, "beep") == 0) {
      beep(200);
      sendStatus("beep", "Beep played");
    }
    else {
      sendStatus("error", "Invalid command");
    }
    return;
  }
  
  // Process JSON commands
  const char* type = doc["cmd"];
  
  if (type && strcmp(type, "led") == 0) {
    // LED control command - example: {"cmd":"led","led":"green","state":1}
    const char* led = doc["led"];
    int state = doc["state"];
    
    if (led && strcmp(led, "red") == 0) {
      digitalWrite(LED_RED, state ? HIGH : LOW);
      sendStatus("led", "Red LED changed");
    }
    else if (led && strcmp(led, "green") == 0) {
      digitalWrite(LED_GREEN, state ? HIGH : LOW);
      sendStatus("led", "Green LED changed");
    }
    else if (led && strcmp(led, "blue") == 0) {
      digitalWrite(LED_BLUE, state ? HIGH : LOW);
      sendStatus("led", "Blue LED changed");
    }
    else {
      sendStatus("error", "Invalid LED");
    }
  }
  else {
    sendStatus("error", "Unknown command");
  }
}

// Reset the RFID reader
void resetReader() {
  rfid.PCD_Reset();
  rfid.PCD_Init();
  
  // Flash all LEDs
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(LED_BLUE, HIGH);
  delay(300);
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_BLUE, HIGH);
}

// Check if a card is present and read it
void checkCardPresence() {
  // Return if no card is present
  if (!rfid.PICC_IsNewCardPresent())
    return;

  // Return if card could not be read
  if (!rfid.PICC_ReadCardSerial())
    return;
    
  // Get current time
  unsigned long currentTime = millis();
  
  // Check card UID
  byte currentCard[4];
  for (byte i = 0; i < 4; i++) {
    currentCard[i] = rfid.uid.uidByte[i];
  }
  
  // Compare with last read card
  bool isSameCard = true;
  for (byte i = 0; i < 4; i++) {
    if (currentCard[i] != lastReadCard[i]) {
      isSameCard = false;
      break;
    }
  }
  
  // Process if it's a different card or enough time has passed
  if (!isSameCard || (currentTime - lastReadTime > DEBOUNCE_TIME)) {
    // Update last read data
    for (byte i = 0; i < 4; i++) {
      lastReadCard[i] = currentCard[i];
    }
    lastReadTime = currentTime;
    
    // Visual feedback
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_BLUE, LOW);
    beep(150);
    
    // Send card data
    sendCardData(rfid.uid.uidByte, rfid.uid.size);
    
    // Return to ready state
    delay(500);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_BLUE, HIGH);
  }
  
  // Halt PICC and stop encryption
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// Send card UID data via serial in JSON format
void sendCardData(byte *buffer, byte bufferSize) {
  StaticJsonDocument<200> doc;
  
  doc["type"] = "card";
  doc["timestamp"] = millis();
  
  // Convert UID bytes to hex string
  char uidString[32] = "";
  for (byte i = 0; i < bufferSize; i++) {
    char byteHex[3];
    sprintf(byteHex, "%02X", buffer[i]);
    strcat(uidString, byteHex);
  }
  
  doc["card_id"] = uidString;
  doc["raw_size"] = bufferSize;
  
  // Serialize and send
  serializeJson(doc, Serial);
  Serial.println();
}

// Send status message in JSON format
void sendStatus(const char* statusType, const char* message) {
  StaticJsonDocument<200> doc;
  
  doc["type"] = "status";
  doc["status"] = statusType;
  doc["message"] = message;
  doc["timestamp"] = millis();
  
  // Serialize and send
  serializeJson(doc, Serial);
  Serial.println();
}

// Send periodic status updates
void sendPeriodicStatus() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastStatusTime > STATUS_INTERVAL) {
    lastStatusTime = currentTime;
    
    // Check if RFID reader is responding
    bool readerOk = rfid.PCD_PerformSelfTest();
    
    if (readerOk) {
      // Re-initialize after self-test
      rfid.PCD_Init();
      sendStatus("heartbeat", "Reader OK");
    } else {
      sendStatus("error", "Reader self-test failed");
      digitalWrite(LED_RED, HIGH);
      digitalWrite(LED_BLUE, LOW);
      delay(500);
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_BLUE, HIGH);
    }
  }
}

// Generate a beep sound
void beep(unsigned int duration) {
  tone(BUZZER_PIN, 2000, duration);
} 