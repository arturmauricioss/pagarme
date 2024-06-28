const axios = require('axios');

export default async function handler(req, res) {
    const PagarMeApiKey = process.env.PAGARME_API_KEY;

    if (req.method === 'POST') {
        try {
            const response = await axios.post('https://api.pagar.me/1/transactions', {
                api_key: PagarMeApiKey,
                amount: req.body.amount,
                card_number: req.body.card_number,
                card_cvv: req.body.card_cvv,
                card_expiration_date: req.body.card_expiration_date,
                card_holder_name: req.body.card_holder_name,
                customer: req.body.customer
            });
            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json(error.response.data);
        }
    } else {
        res.status(405).json({ message: 'Only POST requests are allowed' });
    }
}
