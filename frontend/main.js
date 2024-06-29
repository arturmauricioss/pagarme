document.getElementById('resolution').addEventListener('change', function() {
    const resolution = parseInt(this.value);
    const svg = document.getElementById('svg-circle');
    svg.setAttribute('width', resolution);
    svg.setAttribute('height', resolution);
});

document.getElementById('fill-color').addEventListener('change', function() {
    const fillColor = this.value;
    document.getElementById('circle').setAttribute('fill', fillColor);
});

document.getElementById('border-color').addEventListener('change', function() {
    const borderColor = this.value;
    document.getElementById('circle').setAttribute('stroke', borderColor);
});

function handlePayment(method) {
    const resolution = document.getElementById('resolution').value;
    const fillColor = document.getElementById('fill-color').value;
    const borderColor = document.getElementById('border-color').value;

    fetch(`https://seu-backend.vercel.app/pay/${method}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolution, fillColor, borderColor })
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = data.payment_url;
    })
    .catch(error => console.error('Erro:', error));
}

document.getElementById('pay-pix').addEventListener('click', function() {
    handlePayment('pix');
});

document.getElementById('pay-boleto').addEventListener('click', function() {
    handlePayment('boleto');
});

document.getElementById('pay-card').addEventListener('click', function() {
    handlePayment('card');
});

document.getElementById('pay-paypal').addEventListener('click', function() {
    handlePayment('paypal');
});
