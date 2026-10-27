#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// =====================================================
// PIN CONFIGURATION
// =====================================================

// -------------------- Station 1 --------------------
#define VOLTAGE_PIN_1 34
#define CURRENT_PIN_1 35
#define SWITCH_PIN_1  27
#define LED_PIN_1     26

// -------------------- Station 2 --------------------
#define VOLTAGE_PIN_2 32
#define CURRENT_PIN_2 33
#define SWITCH_PIN_2  25
#define LED_PIN_2     14

// -------------------- OLED --------------------------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define OLED_RESET -1
#define OLED_ADDRESS 0x3C

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);

// =====================================================
// VARIABLES
// =====================================================

// Charging states
bool charging1 = false;
bool charging2 = false;

// Sampling
unsigned long lastSampleTime = 0;
const unsigned long SAMPLE_INTERVAL = 1000;

// Energy consumed
float energyKWh1 = 0.0;
float energyKWh2 = 0.0;

// =====================================================
// SETUP
// =====================================================

void setup() {

  // ---------------------------------------------------
  // Serial
  // ---------------------------------------------------

  Serial.begin(115200);

  // ---------------------------------------------------
  // Switches
  // ---------------------------------------------------

  // Switch is connected between GPIO and GND
  pinMode(SWITCH_PIN_1, INPUT_PULLUP);
  pinMode(SWITCH_PIN_2, INPUT_PULLUP);

  // ---------------------------------------------------
  // LEDs
  // ---------------------------------------------------

  pinMode(LED_PIN_1, OUTPUT);
  pinMode(LED_PIN_2, OUTPUT);

  // Initially OFF
  digitalWrite(LED_PIN_1, LOW);
  digitalWrite(LED_PIN_2, LOW);

  // ---------------------------------------------------
  // ADC
  // ---------------------------------------------------

  analogReadResolution(12);

  // ---------------------------------------------------
  // OLED
  // ---------------------------------------------------

  Wire.begin(21, 22);

  if (!display.begin(
        SSD1306_SWITCHCAPVCC,
        OLED_ADDRESS
      )) {

    Serial.println("OLED initialization failed!");

    while (true) {
      delay(1000);
    }
  }

  // ---------------------------------------------------
  // Startup screen
  // ---------------------------------------------------

  display.clearDisplay();

  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(2);

  display.setCursor(15, 5);
  display.println("EV");

  display.setCursor(5, 30);
  display.println("STATIONS");

  display.display();

  delay(2000);

  // ---------------------------------------------------
  // Read initial switch states
  // ---------------------------------------------------

  charging1 = (digitalRead(SWITCH_PIN_1) == LOW);
  charging2 = (digitalRead(SWITCH_PIN_2) == LOW);

  // ---------------------------------------------------
  // Initial LED states
  // ---------------------------------------------------

  digitalWrite(
    LED_PIN_1,
    charging1 ? HIGH : LOW
  );

  digitalWrite(
    LED_PIN_2,
    charging2 ? HIGH : LOW
  );

  // ---------------------------------------------------
  // Serial startup information
  // ---------------------------------------------------

  Serial.println();
  Serial.println("==========================================");
  Serial.println("      EV CHARGING DEMAND SYSTEM");
  Serial.println("==========================================");

  Serial.print("Station 1: ");

  if (charging1) {
    Serial.println("CHARGING");
  } else {
    Serial.println("IDLE");
  }

  Serial.print("Station 2: ");

  if (charging2) {
    Serial.println("CHARGING");
  } else {
    Serial.println("IDLE");
  }

  Serial.println();
}

// =====================================================
// READ VOLTAGE
// =====================================================

// Convert ADC value to 220-240 V

float readVoltage1() {

  int adcValue = analogRead(VOLTAGE_PIN_1);

  float voltage =
    220.0 +
    ((float)adcValue / 4095.0) * 20.0;

  return voltage;
}


float readVoltage2() {

  int adcValue = analogRead(VOLTAGE_PIN_2);

  float voltage =
    220.0 +
    ((float)adcValue / 4095.0) * 20.0;

  return voltage;
}

// =====================================================
// READ CURRENT
// =====================================================

// Convert ADC value to 0-32 A

float readCurrent1() {

  int adcValue = analogRead(CURRENT_PIN_1);

  float current =
    ((float)adcValue / 4095.0) * 32.0;

  return current;
}


float readCurrent2() {

  int adcValue = analogRead(CURRENT_PIN_2);

  float current =
    ((float)adcValue / 4095.0) * 32.0;

  return current;
}

// =====================================================
// UPDATE OLED
// =====================================================

void updateDisplay(
  float power1,
  float power2,
  float totalPower
) {

  display.clearDisplay();

  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(1);

  // ---------------------------------------------------
  // Header
  // ---------------------------------------------------

  display.setCursor(0, 0);

  display.println("EV CHARGING STATIONS");

  display.drawLine(
    0,
    10,
    127,
    10,
    SSD1306_WHITE
  );

  // ---------------------------------------------------
  // Station 1
  // ---------------------------------------------------

  display.setCursor(0, 16);

  display.print("S1: ");

  display.print(power1, 2);

  display.print("kW ");

  if (charging1) {
    display.println("ON");
  } else {
    display.println("OFF");
  }

  // ---------------------------------------------------
  // Station 2
  // ---------------------------------------------------

  display.setCursor(0, 28);

  display.print("S2: ");

  display.print(power2, 2);

  display.print("kW ");

  if (charging2) {
    display.println("ON");
  } else {
    display.println("OFF");
  }

  // ---------------------------------------------------
  // Separator
  // ---------------------------------------------------

  display.drawLine(
    0,
    39,
    127,
    39,
    SSD1306_WHITE
  );

  // ---------------------------------------------------
  // Total demand
  // ---------------------------------------------------

  display.setCursor(0, 44);

  display.print("TOTAL: ");

  display.print(totalPower, 2);

  display.println(" kW");

  // ---------------------------------------------------
  // Overall status
  // ---------------------------------------------------

  display.setCursor(0, 56);

  if (charging1 || charging2) {

    display.print("STATUS: CHARGING");

  } else {

    display.print("STATUS: IDLE");
  }

  display.display();
}

// =====================================================
// SEND IoT DATA
// =====================================================

void sendData(
  float voltage1,
  float current1,
  float power1,
  float voltage2,
  float current2,
  float power2,
  float totalPower
) {

  Serial.print("{");

  // ---------------------------------------------------
  // Station 1
  // ---------------------------------------------------

  Serial.print("\"station_1\":{");

  Serial.print("\"station_id\":\"EV_STATION_01\"");

  Serial.print(",");

  Serial.print("\"voltage\":");
  Serial.print(voltage1, 2);

  Serial.print(",");

  Serial.print("\"current\":");
  Serial.print(current1, 2);

  Serial.print(",");

  Serial.print("\"power_kw\":");
  Serial.print(power1, 3);

  Serial.print(",");

  Serial.print("\"energy_kwh\":");
  Serial.print(energyKWh1, 4);

  Serial.print(",");

  Serial.print("\"charging\":");
  Serial.print(charging1 ? 1 : 0);

  Serial.print(",");

  Serial.print("\"status\":\"");

  if (charging1) {
    Serial.print("CHARGING");
  } else {
    Serial.print("IDLE");
  }

  Serial.print("\"");

  Serial.print("}");

  // ---------------------------------------------------
  // Station 2
  // ---------------------------------------------------

  Serial.print(",");

  Serial.print("\"station_2\":{");

  Serial.print("\"station_id\":\"EV_STATION_02\"");

  Serial.print(",");

  Serial.print("\"voltage\":");
  Serial.print(voltage2, 2);

  Serial.print(",");

  Serial.print("\"current\":");
  Serial.print(current2, 2);

  Serial.print(",");

  Serial.print("\"power_kw\":");
  Serial.print(power2, 3);

  Serial.print(",");

  Serial.print("\"energy_kwh\":");
  Serial.print(energyKWh2, 4);

  Serial.print(",");

  Serial.print("\"charging\":");
  Serial.print(charging2 ? 1 : 0);

  Serial.print(",");

  Serial.print("\"status\":\"");

  if (charging2) {
    Serial.print("CHARGING");
  } else {
    Serial.print("IDLE");
  }

  Serial.print("\"");

  Serial.print("}");

  // ---------------------------------------------------
  // Total demand
  // ---------------------------------------------------

  Serial.print(",");

  Serial.print("\"total_demand_kw\":");
  Serial.print(totalPower, 3);

  // ---------------------------------------------------
  // Timestamp
  // ---------------------------------------------------

  Serial.print(",");

  Serial.print("\"timestamp_ms\":");
  Serial.print(millis());

  Serial.println("}");
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop() {

  // ---------------------------------------------------
  // Read switches
  // ---------------------------------------------------

  /*
    INPUT_PULLUP means:

    Station 1:
    Switch OFF → GPIO27 HIGH → IDLE
    Switch ON  → GPIO27 LOW  → CHARGING

    Station 2:
    Switch OFF → GPIO25 HIGH → IDLE
    Switch ON  → GPIO25 LOW  → CHARGING
  */

  charging1 =
    (digitalRead(SWITCH_PIN_1) == LOW);

  charging2 =
    (digitalRead(SWITCH_PIN_2) == LOW);

  // ---------------------------------------------------
  // LEDs follow switches
  // ---------------------------------------------------

  digitalWrite(
    LED_PIN_1,
    charging1 ? HIGH : LOW
  );

  digitalWrite(
    LED_PIN_2,
    charging2 ? HIGH : LOW
  );

  // ---------------------------------------------------
  // Take measurement every 1 second
  // ---------------------------------------------------

  if (
    millis() - lastSampleTime >=
    SAMPLE_INTERVAL
  ) {

    lastSampleTime = millis();

    // =================================================
    // STATION 1
    // =================================================

    float voltage1 = readVoltage1();

    float current1 = readCurrent1();

    // If charger is OFF, current = 0
    if (!charging1) {
      current1 = 0.0;
    }

    // P = V × I
    float power1 =
      (voltage1 * current1) / 1000.0;

    // =================================================
    // STATION 2
    // =================================================

    float voltage2 = readVoltage2();

    float current2 = readCurrent2();

    // If charger is OFF, current = 0
    if (!charging2) {
      current2 = 0.0;
    }

    // P = V × I
    float power2 =
      (voltage2 * current2) / 1000.0;

    // =================================================
    // TOTAL DEMAND
    // =================================================

    float totalPower =
      power1 + power2;

    // =================================================
    // ENERGY CALCULATION
    // =================================================

    if (charging1) {

      float timeHours =
        SAMPLE_INTERVAL / 3600000.0;

      energyKWh1 +=
        power1 * timeHours;
    }

    if (charging2) {

      float timeHours =
        SAMPLE_INTERVAL / 3600000.0;

      energyKWh2 +=
        power2 * timeHours;
    }

    // =================================================
    // OLED
    // =================================================

    updateDisplay(
      power1,
      power2,
      totalPower
    );

    // =================================================
    // SERIAL / IoT JSON
    // =================================================

    sendData(
      voltage1,
      current1,
      power1,
      voltage2,
      current2,
      power2,
      totalPower
    );
  }
}