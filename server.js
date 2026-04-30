const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// =============================
// 🔐 CONFIG
// =============================
const ACCESS_TOKEN = 'APP_USR-2523882070735687-042813-6ce077c5048d22241bc18e42bb26e71b-349504211'; // coloque seu token correto aqui
const ESP32_IP = "http://192.168.15.43";
const BASE_URL = "https://pix-lavanderia-production.up.railway.app";

// =============================
// ✅ ROTA TESTE (IMPORTANTE PRO RAILWAY)
// =============================
app.get('/', (req, res) => {
  res.status(200).send("Servidor online 🚀");
});

// =============================
// 🚀 CRIAR PAGAMENTO
// =============================
app.get('/criar-pix', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      {
        items: [
          {
            title: "Sacola Lavanderia",
            quantity: 1,
            unit_price: 9.90
          }
        ],
        payment_methods: {
          installments: 1
        },
        statement_descriptor: "LAVANDERIA",
        notification_url: `${BASE_URL}/webhook`
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const init_point = response.data.init_point;

    console.log("🔗 Checkout:", init_point);

    return res.redirect(init_point);

  } catch (err) {
    console.log("❌ ERRO AO CRIAR PAGAMENTO:");
    console.log(err.response?.data || err.message);

    return res.status(500).send("Erro ao gerar pagamento");
  }
});

// =============================
// 🔔 WEBHOOK
// =============================
app.post('/webhook', async (req, res) => {
  try {
    console.log("🔔 Webhook recebido:", req.body);

    let paymentId = null;

    if (req.body.type === "payment") {
      paymentId = req.body.data.id;
    }

    if (req.body.topic === "payment") {
      paymentId = req.body.resource;
    }

    if (!paymentId) {
      return res.sendStatus(200);
    }

    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    const status = response.data.status;

    console.log("💰 Status:", status);

    if (status === "approved") {
      console.log("🚀 LIBERANDO MÁQUINA");

      try {
        await axios.get(`${ESP32_IP}/liberar`);
        console.log("✅ LIBERADO");
      } catch (err) {
        console.log("❌ ERRO ESP32:", err.message);
      }
    }

    return res.sendStatus(200);

  } catch (err) {
    console.log("❌ ERRO WEBHOOK:", err.response?.data || err.message);
    return res.sendStatus(500);
  }
});

// =============================
// 🚀 SERVIDOR (RAILWAY)
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});