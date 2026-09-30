const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');

const app = express();
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Meu Financeiro API' });
});

// Servir os arquivos estáticos do Frontend React compilado no Railway
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Rota coringa (SPA): Qualquer rota que não seja da API carrega o index.html do React
app.use((req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = app;
