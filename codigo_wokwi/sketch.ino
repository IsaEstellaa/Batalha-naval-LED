#include <MD_MAX72xx.h>
#include <SPI.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

#define HARDWARE_TYPE MD_MAX72XX::FC16_HW
#define MAX_DEVICES 1

#define DATA_PIN 23
#define CS_PIN   5
#define CLK_PIN  18

#define BTN_RIGHT 13
#define BTN_LEFT 26
#define BTN_DOWN  12
#define BTN_UP  27
#define BTN_SELECT 14
#define BTN_RESET 4

const char* ssid = "Wokwi-GUEST";
const char* password = "";

MD_MAX72XX mx = MD_MAX72XX(HARDWARE_TYPE, DATA_PIN, CLK_PIN, CS_PIN, MAX_DEVICES);

int cursorX = 0;
int cursorY = 0;
int tentativa = 1;
int rodada = 1;

void enviarJogada(int x, int y) {

  if (WiFi.status() == WL_CONNECTED) {

    WiFiClientSecure client;
    client.setInsecure();  // ignora certificado

    HTTPClient http;

    http.begin(client, "https://fantastic-waddle-q4jqpjwp5g7cgq5-3000.app.github.dev/jogada");
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"jogador_id\":1,";
    json += "\"rodada\":1,";
    json += "\"tentativa\": ";
    json += tentativa;
    json += ",";
    json += "\"coordenadas\":[{\"x\":";
    json += x;
    json += ",\"y\":";
    json += y;
    json += "}]}";

    Serial.println(json);

    int response = http.POST(json);

    if (response == 201) {
      tentativa++;
      Serial.println("Coordenada enviada com sucesso!");
    } 
    else {
      Serial.print("Erro ao enviar coordenada. Codigo: ");
      Serial.println(response);
    }

    http.end();
  }
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi conectado!");
  
  Serial.begin(115200);

  mx.begin();
  mx.clear();

  pinMode(BTN_RIGHT, INPUT_PULLUP);
  pinMode(BTN_LEFT, INPUT_PULLUP);
  pinMode(BTN_DOWN, INPUT_PULLUP);
  pinMode(BTN_UP, INPUT_PULLUP);
  pinMode(BTN_SELECT, INPUT_PULLUP);
  pinMode(BTN_RESET, INPUT_PULLUP);
}

void loop() {

  // DIREITA
  if (digitalRead(BTN_RIGHT) == LOW) {
    cursorX = (cursorX + 1) % 8;
    delay(200);
  }

  // ESQUERDA
  if (digitalRead(BTN_LEFT) == LOW) {
    cursorX = (cursorX + 7) % 8;
    delay(200);
  }

  // CIMA
  if (digitalRead(BTN_UP) == LOW) {
    cursorY = (cursorY + 7) % 8;
    delay(200);
  }

  // BAIXO
  if (digitalRead(BTN_DOWN) == LOW) {
    cursorY = (cursorY + 1) % 8;
    delay(200);
  }

  if (digitalRead(BTN_SELECT) == LOW) {
    Serial.print("X: ");
    Serial.print(cursorX);
    Serial.print(" Y: ");
    Serial.println(cursorY);
    
    enviarJogada(cursorX, cursorY);

    delay(200);
  }

  if (digitalRead(BTN_RESET) == LOW) {

    rodada = 1;
    tentativa = 1;

    Serial.println("Jogo reiniciado!");

    delay(300);
  }

  desenharCursor();
}

void desenharCursor() {
  mx.clear();

  if ((millis() / 300) % 2 == 0) {
    mx.setPoint(cursorY, cursorX, true);
  }
}