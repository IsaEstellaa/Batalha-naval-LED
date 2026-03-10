// Importa a biblioteca firebase-admin para acessar serviços do Firebase no backend
const admin = require('firebase-admin');

const serviceAccount = require('./config/firebaseKey');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

  databaseURL: "https://batalha-naval-esp32-default-rtdb.firebaseio.com/"
});

const db = admin.database();

// Importa o framework Express para criar o servidor HTTP
const express = require('express');

const cors = require('cors');

const app = express();

app.use(cors()); 

app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Configuração do Swagger
const options = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'API de Tabuleiro Avançada',
      version: '1.0.0',
      description: 'API para registrar jogadas com múltiplas coordenadas', 
    }
  },
  apis: ['./index.js'], 
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * Documentação Swagger da rota POST /jogada
 * Essa rota salva uma jogada com múltiplas coordenadas
 */
app.post('/jogada', async (req, res) => {
  try {

    console.log("Jogada recebida:");
    console.log(req.body);

    const { jogador_id, rodada, tentativa, coordenadas } = req.body;

    if (
      jogador_id === undefined ||
      rodada === undefined ||
      tentativa === undefined ||
      !Array.isArray(coordenadas)
    ) {
      return res.status(400).json({ erro: 'Campos obrigatórios inválidos' });
    }

    const jogada = { jogador_id, rodada, tentativa, coordenadas };

    const ref = db.ref('jogadas');

    const novaJogada = ref.push();

    // Salva os dados da jogada no banco
    await novaJogada.set(jogada);

    res.status(201).json({
      mensagem: 'Jogada salva no Realtime Database',
      id: novaJogada.key, // ID gerado automaticamente
      jogada
    });

  } catch (error) {

    res.status(500).json({ erro: error.message });
  }
});

/**
 * Documentação Swagger da rota GET /retorna-jogadas
 * Retorna todas as jogadas armazenadas
 */
app.get('/retorna-jogadas', async (req, res) => {
  try {

    // Busca todos os dados armazenados no nó "jogadas"
    const snapshot = await db.ref('jogadas').once('value');

    const dados = snapshot.val();

    const lista = [];

    for (const id in dados) {

      lista.push({
        id: id,
        ...dados[id]
      });
    }

    console.log("Jogadas retornadas:", lista);

    res.status(200).json(lista);

  } catch (error) {

    console.error("Erro ao buscar jogadas:", error);

    res.status(500).json({
      erro: "Erro ao buscar jogadas"
    });

  }
});

// Define a porta do servidor (usa variável de ambiente ou 3000)
const PORT = process.env.PORT || 3000;

// Inicia o servidor Express
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

