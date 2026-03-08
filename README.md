# 🎮 Batalha Naval - ESP32 + Firebase

Projeto de um jogo estilo Batalha Naval utilizando um ESP32 para enviar coordenadas para um servidor, que salva as jogadas em um banco de dados.
O jogo contará rodadas e tentativas para acertar o navio (gerado aleatoriamente, de forma automática) ao estilo do jogo [Termo](https://term.ooo/).

* Quando o usuário acerta uma das posições, o pixel fica verde.
* Quando o usuário acerta a coluna ou a linha mas erra a posição exata, o pixel fica amarelo.
* Quando o usuário erra a posição e não consegue acertar nem a coluna ou a linha, o pixel fica vermelho.


## 📦 Tecnologias utilizadas

* ESP32
* Node.js
* Firebase Realtime Database
* Wokwi (simulação do hardware)

## ⚙️ Como funciona

O ESP32 envia coordenadas selecionadas pelo jogador para uma API.  
Cada coordenada enviada gera uma **tentativa** dentro de uma **rodada**.

Exemplo de estrutura salva no banco:

```json
jogadas
   -ID1
      jogador_id: 1
      rodada: 1
      tentativa: 1
      coordenadas
         x: 3
         y: 4

   -ID2
      jogador_id: 1
      rodada: 1
      tentativa: 2
      coordenadas
         x: 5
         y: 2
```

Cada nova coordenada enviada:

* incrementa o número da tentativa
* é salva no banco de dados

O botão de reiniciar jogo:
* zera a rodada
* reinicia as tentativas

## 🚀 Rodando o servidor (Codespaces)
Para iniciar o servidor no GitHub Codespaces, execute:

```
npm install
npm start
```
## 🔑 Configuração das chaves

As credenciais do Firebase não estão incluídas no repositório por segurança.

Crie um arquivo baseado no exemplo:
```
config/firebaseKey.example.json
```
e renomeie para:
```
config/firebaseKey.json
```
Depois preencha com as credenciais do seu projeto Firebase.
* As credenciais podem ser baixadas diretamente no projeto.

## 🧪 Simulação

O hardware pode ser testado usando o [Wokwi](https://wokwi.com/), que permite simular por enquanto:
* ESP32
* Botões
* Envio das coordenadas

---

### 📌 Status do projeto

✔ Envio de coordenadas

✔ Incremento automático de tentativas

✔ Salvamento das jogadas no banco

✔ Botão de reinício do jogo

### 🚧 Próximos passos:

* Sistema completo de rodadas
* Leitura das jogadas do banco
* Adição do sistema de cores (semelhante ao Termo)
* Lógica de jogo completa