const express = require('express');

const app = express();

// rota principal
app.get('/', (req, res) => {
  res.send('OK FUNCIONANDO 🚀');
});

// rota teste
app.get('/ping', (req, res) => {
  res.send('pong');
});

// porta correta do Railway
const PORT = process.env.PORT || 3000;

// escuta externa (OBRIGATÓRIO)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});