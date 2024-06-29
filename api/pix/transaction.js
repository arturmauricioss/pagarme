const express = require('express');
const QRCode = require('qrcode');
const app = express();

// Chave Pix (deve ser a sua chave Pix de produção ou teste fornecida pelo seu banco)
const pixKey = '761e2934-2b53-4059-a31d-62eaad45168e';

// Função para gerar o payload Pix
function generatePixPayload(amount, description) {
    const valor = (amount * 100).toString().padStart(10, '0'); // Valor em centavos
    const payload = [
        '000201', // Identificador do padrão
        '26360014BR.GOV.BCB.PIX', // Identificador do tipo de chave
        `0114${pixKey}`, // Chave Pix
        '02020', // Valor do pagamento
        valor,
        '520400005303986', // Moeda e país
        '5405', // Valor
        valor,
        '5802BR', // País e moeda
        '5925MERCHANT_NAME', // Nome do comerciante
        '6009BRASIL', // Nome do país
        '610805409000', // Data de vencimento
        '62070503', // Informações adicionais
        description, // Descrição do pagamento
    ].join('');

    return payload;
}

app.get('/api/pix/qr-code', (req, res) => {
    const amount = parseFloat(req.query.amount) || 100.00; // Valor do pagamento
    const description = req.query.description || 'Pagamento de Blusa';

    // Gerar o payload Pix
    const pixPayload = generatePixPayload(amount, description);
    QRCode.toDataURL(pixPayload, (err, qrCodeData) => {
        if (err) {
            return res.status(500).send('Erro ao gerar QR Code');
        }
        res.json({ qrCodeData });
    });
});

app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
});

module.exports = app;
