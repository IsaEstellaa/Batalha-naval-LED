const admin = require('firebase-admin');
const serviceAccount = require('./config/firebaseKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://batalha-naval-30c5f-default-rtdb.firebaseio.com"
});

const db = admin.database();

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Swagger
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
 * @swagger
 * /jogada:
 *   post:
 *     summary: Salva uma jogada com várias coordenadas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jogador_id:
 *                 type: integer
 *               round:
 *                 type: integer
 *               tentativa:
 *                 type: integer
 *               coordenadas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x:
 *                       type: integer
 *                     y:
 *                       type: integer
 *             required:
 *               - jogador_id
 *               - round
 *               - tentativa
 *               - coordenadas
 *     responses:
 *       201:
 *         description: Jogada salva com sucesso
 */
app.post('/jogada', async (req, res) => {
  try {
    const { jogador_id, round, tentativa, coordenadas } = req.body;

    if (
      jogador_id === undefined ||
      round === undefined ||
      tentativa === undefined ||
      !Array.isArray(coordenadas)
    ) {
      return res.status(400).json({ erro: 'Campos obrigatórios inválidos' });
    }

    const jogada = { jogador_id, round, tentativa, coordenadas };

    const ref = db.ref('jogadas');
    const novaJogada = ref.push();
    await novaJogada.set(jogada);

    res.status(201).json({
      mensagem: 'Jogada salva no Realtime Database',
      id: novaJogada.key,
      jogada
    });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/**
 * @swagger
 * /jogada:
 *   get:
 *     summary: Retorna todas as jogadas registradas
 *     responses:
 *       200:
 *         description: Lista de jogadas
 */
app.get('/jogada', async (req, res) => {
  const snapshot = await db.ref('jogadas').once('value');
  const dados = snapshot.val();

  res.json(dados || {});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));