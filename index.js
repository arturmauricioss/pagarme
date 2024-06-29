const express = require('express');
const path = require('path');
const paypalRouter = require('./api/paypal/transaction');
const pixRouter = require('./api/pix/transaction');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para rotas de API
app.use('/api/paypal', paypalRouter);
app.use('/api/pix', pixRouter);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
