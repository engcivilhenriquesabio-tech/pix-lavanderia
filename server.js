process.on('uncaughtException', (err) => {
  console.error('ERRO CRÍTICO:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('PROMISE ERROR:', err);
});
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('OK FUNCIONANDO 🚀');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('Rodando na porta', PORT);
});