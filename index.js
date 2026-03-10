// Importa a biblioteca firebase-admin para acessar serviços do Firebase no backend
const admin = require('firebase-admin');

// Importa o arquivo com a chave privada da conta de serviço do Firebase
const serviceAccount = require('./config/firebaseKey');

// Inicializa o Firebase Admin SDK usando as credenciais da conta de serviço
admin.initializeApp({
  // Define as credenciais para autenticação no Firebase
  credential: admin.credential.cert(serviceAccount),

  // URL do banco de dados Realtime Database do Firebase
  databaseURL: "https://batalha-naval-esp32-default-rtdb.firebaseio.com/"
});

// Cria uma referência para o banco de dados
const db = admin.database();

// Importa o framework Express para criar o servidor HTTP
const express = require('express');

// Importa o middleware CORS para permitir requisições de diferentes origens
const cors = require('cors');

// Cria uma instância da aplicação Express
const app = express();

// Habilita o CORS para todas as rotas
app.use(cors()); 

// Permite que o Express interprete requisições com JSON no corpo
app.use(express.json());

// Importa bibliotecas para documentação da API com Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Configuração do Swagger
const options = {
  definition: {
    openapi: '3.0.0', // versão da especificação OpenAPI
    info: {
      title: 'API de Tabuleiro Avançada', // título da documentação
      version: '1.0.0', // versão da API
      description: 'API para registrar jogadas com múltiplas coordenadas', // descrição
    }
  },
  apis: ['./index.js'], // arquivo onde estão as anotações Swagger
};

// Gera a documentação Swagger baseada nas anotações
const specs = swaggerJsdoc(options);

// Cria a rota /api-docs para acessar a interface da documentação
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * Documentação Swagger da rota POST /jogada
 * Essa rota salva uma jogada com múltiplas coordenadas
 */
app.post('/jogada', async (req, res) => {
  try {

    // Exibe no console a jogada recebida
    console.log("Jogada recebida:");
    console.log(req.body);

    // Extrai os dados enviados no corpo da requisição
    const { jogador_id, rodada, tentativa, coordenadas } = req.body;

    // Validação dos campos obrigatórios
    if (
      jogador_id === undefined ||
      rodada === undefined ||
      tentativa === undefined ||
      !Array.isArray(coordenadas)
    ) {
      // Retorna erro se algum campo estiver inválido
      return res.status(400).json({ erro: 'Campos obrigatórios inválidos' });
    }

    // Cria um objeto com os dados da jogada
    const jogada = { jogador_id, rodada, tentativa, coordenadas };

    // Cria uma referência ao nó "jogadas" no Firebase
    const ref = db.ref('jogadas');

    // Cria um novo registro com ID automático
    const novaJogada = ref.push();

    // Salva os dados da jogada no banco
    await novaJogada.set(jogada);

    // Retorna resposta de sucesso
    res.status(201).json({
      mensagem: 'Jogada salva no Realtime Database',
      id: novaJogada.key, // ID gerado automaticamente
      jogada
    });

  } catch (error) {

    // Retorna erro caso algo falhe
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

    // Obtém os dados em formato JSON
    const dados = snapshot.val();

    // Cria um array para armazenar as jogadas formatadas
    const lista = [];

    // Percorre cada registro retornado
    for (const id in dados) {

      // Adiciona a jogada no array incluindo o ID do Firebase
      lista.push({
        id: id,
        ...dados[id]
      });
    }

    // Exibe no console as jogadas retornadas
    console.log("Jogadas retornadas:", lista);

    // Retorna as jogadas ao cliente
    res.status(200).json(lista);

  } catch (error) {

    // Exibe erro no console
    console.error("Erro ao buscar jogadas:", error);

    // Retorna erro ao cliente
    res.status(500).json({
      erro: "Erro ao buscar jogadas"
    });

  }
});

// Define a porta do servidor (usa variável de ambiente ou 3000)
const PORT = process.env.PORT || 3000;

// Inicia o servidor Express
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
