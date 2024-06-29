const express = require('express');
const paypal = require('paypal-rest-sdk');
const QRCode = require('qrcode'); // Biblioteca para gerar QR Codes
const app = express();
app.use(express.json());

// Configuração do PayPal
paypal.configure({
  mode: 'sandbox', // ou 'live' para produção
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

// Endpoint para criar uma transação do PayPal
app.post('/api/paypal/transaction', (req, res) => {
  const { size, color, price } = req.body;
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'https://arturmauricioss.github.io/pagarme/public/success.html',
      cancel_url: 'https://arturmauricioss.github.io/pagarme/public/falha.html',
    },
    transactions: [{
      item_list: {
        items: [{
          name: `Blusa ${size} ${color}`,
          sku: 'blusa',
          price: price,
          currency: 'BRL',
          quantity: 1,
        }],
      },
      amount: {
        currency: 'BRL',
        total: price,
      },
      description: 'Descrição da compra da blusa.',
    }],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      res.status(500).json({ error });
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.json({ forwardLink: payment.links[i].href });
        }
      }
    }
  });
});

// Endpoint para gerar QR Code Pix
const pixKey = '761e2934-2b53-4059-a31d-62eaad45168e';

app.get('/api/pix/qr-code', (req, res) => {
    const amount = req.query.amount || 100.00; // Valor do pagamento
    const description = req.query.description || 'Pagamento de Blusa';

    // Gerar o QR Code Pix
    const pixPayload = `00020126360014BR.GOV.BCB.PIX0114${pixKey}02020${amount.toFixed(2)}5204000053039865405${amount.toFixed(2)}5802BR5925MERCHANT_NAME6009BRASIL61080540900062070503${description}`;
    QRCode.toDataURL(pixPayload, (err, qrCodeData) => {
        if (err) {
            return res.status(500).send('Erro ao gerar QR Code');
        }
        res.json({ qrCodeData });
    });
});

// Endpoint de sucesso do PayPal
app.get('/success', (req, res) => {
  // Processar a confirmação do pagamento do PayPal aqui
  res.send('Pagamento realizado com sucesso');
});

// Endpoint de cancelamento do PayPal
app.get('/cancel', (req, res) => {
  // Processar o cancelamento do pagamento do PayPal aqui
  res.send('Pagamento cancelado');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
