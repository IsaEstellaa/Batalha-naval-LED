const express = require('express');
const app = express();
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

let jogadas = []; // array para armazenar todas as jogadas

// Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tabuleiro Avançada',
      version: '1.0.0',
      description: 'API para registrar jogadas com múltiplas coordenadas',
    },
    servers: [{ url: 'http://localhost:3000' }],
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
app.post('/jogada', (req, res) => {
  const { jogador_id, round, tentativa, coordenadas } = req.body;

  if (!jogador_id || !round || !tentativa || !Array.isArray(coordenadas)) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios e coordenadas deve ser um array' });
  }

  const jogada = { jogador_id, round, tentativa, coordenadas };
  jogadas.push(jogada);

  res.status(201).json({ mensagem: 'Jogada salva com sucesso', jogada });
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
app.get('/jogada', (req, res) => {
  res.json(jogadas);
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));