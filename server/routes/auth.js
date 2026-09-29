const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', icon: 'Utensils', color: '#ef4444', type: 'EXPENSE' },
  { name: 'Moradia', icon: 'Home', color: '#f59e0b', type: 'EXPENSE' },
  { name: 'Transporte', icon: 'Car', color: '#3b82f6', type: 'EXPENSE' },
  { name: 'Contas', icon: 'Zap', color: '#8b5cf6', type: 'EXPENSE' },
  { name: 'Lazer', icon: 'Gamepad2', color: '#ec4899', type: 'EXPENSE' },
  { name: 'Compras', icon: 'ShoppingBag', color: '#14b8a6', type: 'EXPENSE' },
  { name: 'Educação', icon: 'GraduationCap', color: '#06b6d4', type: 'EXPENSE' },
  { name: 'Investimentos', icon: 'TrendingUp', color: '#10b981', type: 'EXPENSE' },
  { name: 'Outros', icon: 'MoreHorizontal', color: '#6b7280', type: 'EXPENSE' },
  
  { name: 'Salário', icon: 'DollarSign', color: '#10b981', type: 'INCOME' },
  { name: 'Freelance', icon: 'Briefcase', color: '#3b82f6', type: 'INCOME' },
  { name: 'Comissão', icon: 'Award', color: '#8b5cf6', type: 'INCOME' },
  { name: 'Venda', icon: 'Tag', color: '#f59e0b', type: 'INCOME' },
  { name: 'Renda Extra', icon: 'Coins', color: '#ec4899', type: 'INCOME' },
];

const DEFAULT_ACCOUNTS = [
  { name: 'Nubank', type: 'CHECKING', balance: 0.0, color: '#820ad1' },
  { name: 'Carteira', type: 'CASH', balance: 0.0, color: '#10b981' }
];

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        categories: {
          create: DEFAULT_CATEGORIES
        },
        accounts: {
          create: DEFAULT_ACCOUNTS
        }
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Error registering:', error);
    return res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Sem token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
