const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// 🔧 CONFIG
const ACCESS_TOKEN = 'APP_USR-676309850173258-042919-4cad0df69126844e1f58e65ba49e9603-349504211';

// 🔌 IP FIXO DO ESP32
const ESP32_IP = "http://192.168.15.43";

// 🌐 LINK DO NGROK (ATUALIZA SE MUDAR)
const BASE_URL = "https://pix-lavanderia-production.up.railway.app";

// =============================
// 🚀 ROTA DE PAGAMENTO (QR CODE)
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
    excluded_payment_types: [
      { id: "ticket" },
      { id: "atm" }
    ]
  },
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

    // 🔥 REDIRECIONA DIRETO
    res.redirect(init_point);

  } catch (err) {
    console.log("❌ ERRO AO GERAR PAGAMENTO:", err.response?.data || err);
    res.send("Erro ao gerar pagamento");
  }
});

// =============================
// 🔔 WEBHOOK MERCADO PAGO
// =============================
app.post('/webhook', async (req, res) => {
  try {
    console.log("🔔 Webhook recebido:", req.body);

    if (req.body.type === "payment") {

      const paymentId = req.body.data.id;

      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`
          }
        }
      );

      const status = response.data.status;

      console.log("💰 Status pagamento:", status);

      if (status === "approved") {
        console.log("🚀 LIBERANDO MÁQUINA");

        // 🔌 CHAMA ESP32
        await axios.get(`${ESP32_IP}/liberar`);

        console.log("✅ LIBERADO COM SUCESSO");
      }
    }

    res.sendStatus(200);

  } catch (err) {
    console.log("❌ ERRO WEBHOOK:", err);
    res.sendStatus(500);
  }
});

// =============================
app.listen(3000, () => {
  console.log("🚀 Servidor rodando na porta 3000");
});