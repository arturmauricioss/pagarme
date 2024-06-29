// api/paypal/transaction.js

const express = require('express');
const paypal = require('paypal-rest-sdk');

const app = express();
app.use(express.json());

// Configuração do PayPal
paypal.configure({
  mode: 'sandbox', // ou 'live' para produção
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

app.post('/api/paypal/transaction', (req, res) => {
  const { size, color, price } = req.body;
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://yourwebsite.com/success',
      cancel_url: 'http://yourwebsite.com/cancel',
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
