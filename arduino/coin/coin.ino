// include the library code:
#include <ArduinoJson.h>
#include <Wire.h>
#include <SoftwareSerial.h>

SoftwareSerial centosSerial(10, 11); // RX, TX

// PINS
byte beep = A0;
int relay_acceptor = A1;
byte relay = A2;

// Variables
long time_release = 400;
long time_start = 0;
int seconds = 10;
long countInserted = 0;
volatile long countPulse;
volatile int hopperPulse = 0;
volatile long countPulseChecker = 0;
volatile long count = 0;
volatile unsigned long currentMillis;
volatile unsigned long pulseTime = 0;
volatile unsigned long timer;
volatile bool bufferWait = 0;
bool bufferInserted = 0;
volatile bool bufferAcceptor = 0;
const char* text;
int is_ready = 0;
int send_coin = 0;
long code_start = 0;

const char* token = "";
const char* username = "";
const char* uid = "";
const char* action = "";
int countChange = 0;

bool username_print = 0;

String arduino_token = "ZoqH1lhVpN3hPlo5Bwy0uqxqjiCVZet6";

void setup() {
  
  Serial.begin(57600);
  while (!Serial) {
    // wait serial port initialization
  }

  centosSerial.begin(57600);
  
  // Interrupt pin 2.
  pinMode(2, INPUT_PULLUP);
  // Interrupt pin 2.
  pinMode(3, INPUT_PULLUP);

  // speaker;
  pinMode(beep, OUTPUT);
  digitalWrite(beep, HIGH);
  delay(1000);
  digitalWrite(beep, LOW);
  delay(50);

  // coin acceptor relay
  pinMode(relay_acceptor, OUTPUT);
  digitalWrite(relay_acceptor, HIGH);
  delay(50);

  // Enable 0 interrupt for count acceptor.
  attachInterrupt(0, count_acceptor_interrupt, FALLING);
  delay(50);

  // Enable 1 interrupt for coin hopper.
  attachInterrupt(1, coin_hopper_interrupt, FALLING);
  delay(50);
}

void loop() {
  centosSerial.setTimeout(1000);
  
  if (centosSerial.available()) {
    String received = centosSerial.readStringUntil('\n');

    StaticJsonBuffer<200> jsonBuffer;
    
    JsonObject& root = jsonBuffer.parseObject(received);
    
    // Test if parsing succeeds.
    if (!root.success()) {
      centosSerial.println("parseObject() failed");
      return;
    }
    
    token = root["token"];
    username = root["username"];
    uid = root["uid"];
    action = root["action"];
    countChange = root["change"];
    
  }
  
  if (String(token) == arduino_token && String(action) == "insert") {
    
    if (username_print == 0) {
      
      code_start = millis();

      username_print = 1;

      _beep();

      count = 0;

      // turn-on coinslot acceptor
      digitalWrite(relay_acceptor, LOW);
      delay(50);
    }

    // check if no activity for the user.
    // if no activity then disable the arduino
    if (count == 0 && (countPulseChecker == 0 || countPulseChecker == 1) && millis() - code_start > 30000) {
      // turn-off coin relay
      digitalWrite(relay_acceptor, HIGH);
      delay(50);

      // send message serial.
      centosSerial.println("{\"uid\":" + String(uid) + ",\"coin\":" + String(count) + ",\"op\":\"no_activity\"}");

      code_start = 0;
      username_print = 0;
      countPulseChecker = 0;
      
      //reset json params
      token = "";
      username = "";
      uid = "";

      digitalWrite(beep, HIGH);
      delay(100);
      digitalWrite(beep, LOW);
      delay(50);
    }
    
    // set to 0 for buffer acceptor
    bufferAcceptor = 0;
  
    // count acceptor.
    if (countPulse > 0 && millis() - pulseTime > time_release) {
      countInserted = countPulse;
      countPulse = 0;
      seconds = 10;
  
      bufferInserted = 1;
    }
    
    // ---------------- inserted coin is legit ---------------
    if (countInserted > 0 && bufferInserted == 1) {
      count += countInserted;
      countInserted = 0;
      bufferInserted = 0;
      bufferWait = 1;

      _beep();
    }
    // EOF ---------------- inserted coin is legit ---------------
    
    // Process coin
    if (count >= 1 && millis() - pulseTime > 1500) {
      time_start = millis();
      while (1){
        if (millis() - time_start >= 1000) {
          seconds -= 1;
          break;
        }
      }
  
      if (seconds < 0) { // after 5 seconds will send the coin via serial.
        send_coin = 1;
        is_ready = 0;
      }
    }
  
    if (send_coin == 1) {
      centosSerial.println("{\"uid\":" + String(uid) + ",\"coin\":" + String(count) + ",\"op\":\"insert_coin\"}");

      _beep();
    
      seconds = 10;
      count = 0;
      send_coin = 0;
      //reset json params
      token = "";
      username = "";
      uid = "";
      username_print = 0;
      countPulseChecker = 0;

      // turn-off coin relay
      digitalWrite(relay_acceptor, HIGH);
      delay(50);

      digitalWrite(beep, HIGH);
      delay(100);
      digitalWrite(beep, LOW);
      delay(50);
    }
  }
  else if (String(token) == arduino_token && String(action) == "change") {
    // Dispense hopper.
    // detach interrupt acceptor
    detachInterrupt (0);
    
    // turn-on coin acceptor
    digitalWrite(relay_acceptor, LOW);
    delay(50);

    // detach interrupt acceptor
    detachInterrupt (1);
    delay(50);

    // turn-on relay
    digitalWrite(relay, LOW);
    delay(50);

    hopperPulse = 0;

    currentMillis = millis();
    int temphopperPulse = 0;
    int tempremains = 0;

    while (hopperPulse < countChange) {
      if (hopperPulse > temphopperPulse) {
        currentMillis = millis();
      }
      temphopperPulse = hopperPulse;
      
      // coin hopper dispensing
      if (millis() - currentMillis > 40000) {
        // turn-off coin acceptor
        digitalWrite(relay_acceptor, LOW);
        delay(50);
        // turn-off relay
        digitalWrite(relay, HIGH);
        delay(50);

        // endless loop;
        while (1) {
          digitalWrite(beep, LOW);
          delay(1000);
          digitalWrite(beep, HIGH);
          delay(1000);
        }
      }
    }
                                                                                                                                                                                                                                                                                                                                                                          
    // turn-off relay
    digitalWrite(relay, HIGH);
    delay(50);
    
    // turn-on coin acceptor
    digitalWrite(relay_acceptor, HIGH);
    delay(50);

    // attach again coin acceptor interrupt
    attachInterrupt(0, count_acceptor_interrupt, FALLING);
    delay(50);
    
    // reset count
    count = 0;
  }
}

void count_acceptor_interrupt() {
  byte pin = digitalRead(2);
  static unsigned long last_interrupt_time = 0;
  unsigned long interrupt_time = millis();

  if (pin == LOW && interrupt_time - last_interrupt_time > 80 && bufferAcceptor == 0 && String(token) == arduino_token) {
    pulseTime = millis();
    countPulse++;
    countPulseChecker++;
    bufferWait = 0;
  }
  last_interrupt_time = interrupt_time;
}

void coin_hopper_interrupt() {
  byte pin = digitalRead(3);
  static unsigned long last_interrupt_time = 0;
  unsigned long interrupt_time = millis();
  if (pin == LOW && interrupt_time - last_interrupt_time > 120) {
    hopperPulse += 1;
  } 
  last_interrupt_time = interrupt_time;
}

void _beep() {
  digitalWrite(beep, HIGH);
  delay(100);
  digitalWrite(beep, LOW);
  delay(50);
  digitalWrite(beep, HIGH);
  delay(100);
  digitalWrite(beep, LOW);
  delay(50);
}

