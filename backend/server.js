const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Carregar variáveis de ambiente
const PIX_API_KEY = process.env.PIX_API_KEY;
const BOLETO_API_KEY = process.env.BOLETO_API_KEY;
const CARD_API_KEY = process.env.CARD_API_KEY;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

// Endpoint para pagamento via PIX
app.post('/pay/pix', async (req, res) => {
    const { resolution, fillColor, borderColor } = req.body;
    let amount = 0.10; // 10 centavos por default

    if (resolution === '64') amount = 0.20;
    else if (resolution === '128') amount = 0.30;

    try {
        const response = await axios.post('https://api-do-seu-banco/gerar-qrcode-pix', {
            chave: PIX_API_KEY,
            valor: amount,
            descricao: `Pagamento de SVG - Resolução: ${resolution}px, Cor Interna: ${fillColor}, Cor da Borda: ${borderColor}`
        });

        const payment_url = response.data.qrcode;

        res.json({ payment_url: payment_url });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao gerar QR Code Pix');
    }
});

// Endpoint para pagamento via Boleto
app.post('/pay/boleto', async (req, res) => {
    const { resolution, fillColor, borderColor } = req.body;
    let amount = 0.10; // 10 centavos por default

    if (resolution === '64') amount = 0.20;
    else if (resolution === '128') amount = 0.30;

    try {
        const response = await axios.post('https://api-do-seu-servico-de-boleto/gerar-boleto', {
            api_key: BOLETO_API_KEY,
            valor: amount,
            descricao: `Pagamento de SVG - Resolução: ${resolution}px, Cor Interna: ${fillColor}, Cor da Borda: ${borderColor}`
        });

        const payment_url = response.data.boleto_url;

        res.json({ payment_url: payment_url });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao gerar Boleto');
    }
});

// Endpoint para pagamento com Cartão de Crédito
app.post('/pay/card', async (req, res) => {
    const { resolution, fillColor, borderColor } = req.body;
    let amount = 0.10; // 10 centavos por default

    if (resolution === '64') amount = 0.20;
    else if (resolution === '128') amount = 0.30;

    try {
        const response = await axios.post('https://api-do-seu-servico-de-cartao/processar-pagamento', {
            api_key: CARD_API_KEY,
            valor: amount,
            descricao: `Pagamento de SVG - Resolução: ${resolution}px, Cor Interna: ${fillColor}, Cor da Borda: ${borderColor}`
        });

        const payment_url = response.data.payment_url;

        res.json({ payment_url: payment_url });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar pagamento com cartão');
    }
});

// Endpoint para pagamento com PayPal
app.post('/pay/paypal', async (req, res) => {
    const { resolution, fillColor, borderColor } = req.body;
    let amount = 0.10; // 10 centavos por default

    if (resolution === '64') amount = 0.20;
    else if (resolution === '128') amount = 0.30;

    try {
        // Obter o token de acesso do PayPal
        const authResponse = await axios.post('https://api-m.sandbox.paypal.com/v1/oauth2/token', new URLSearchParams({
            grant_type: 'client_credentials'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: PAYPAL_CLIENT_ID,
                password: PAYPAL_SECRET
            }
        });

        const accessToken = authResponse.data.access_token;

        // Criar pagamento
        const paymentResponse = await axios.post('https://api-m.sandbox.paypal.com/v1/payments/payment', {
            intent: 'sale',
            payer: {
                payment_method: 'paypal'
            },
            transactions: [{
                amount: {
                    total: amount.toFixed(2),
                    currency: 'BRL'
                },
                description: `Pagamento de SVG - Resolução: ${resolution}px, Cor Interna: ${fillColor}, Cor da Borda: ${borderColor}`
            }],
            redirect_urls: {
                return_url: 'https://arturmauricioss.github.io/pagarme/frontend/success.html',
                cancel_url: 'https://arturmauricioss.github.io/pagarme/frontend/cancel.html'
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const approvalUrl = paymentResponse.data.links.find(link => link.rel === 'approval_url').href;

        res.json({ payment_url: approvalUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar pagamento com PayPal');
    }
});

// Configuração do servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
