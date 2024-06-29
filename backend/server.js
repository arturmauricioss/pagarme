const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PIX_API_KEY = 'sua_chave_pix_aqui';
const BOLETO_API_KEY = 'sua_chave_boleto_aqui';
const CARD_API_KEY = 'sua_chave_cartao_aqui';
const PAYPAL_CLIENT_ID = 'seu_client_id_paypal_aqui';
const PAYPAL_SECRET = 'seu_secret_paypal_aqui';

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

app.post('/pay/paypal', async (req, res) => {
    const { resolution, fillColor, borderColor } = req.body;
    let amount = 0.10; // 10 centavos por default

    if (resolution === '64') amount = 0.20;
    else if (resolution === '128') amount = 0.30;

    try {
        const authResponse = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', null, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: PAYPAL_CLIENT_ID,
                password: PAYPAL_SECRET
            },
            params: {
                grant_type: 'client_credentials'
            }
        });

        const accessToken = authResponse.data.access_token;

        const paymentResponse = await axios.post('https://api.sandbox.paypal.com/v1/payments/payment', {
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
                return_url: 'https://seu-site.com/success',
                cancel_url: 'https://seu-site.com/cancel'
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
