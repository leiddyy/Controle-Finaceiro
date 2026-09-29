const express = require('express');
const prisma = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/finance/summary?month=9&year=2026
router.get('/summary', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Contas e Saldo Disponível Total
    const accounts = await prisma.account.findMany({ where: { userId } });
    const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

    // Receitas do mês
    const incomes = await prisma.income.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { category: true, account: true }
    });
    const totalIncomes = incomes.reduce((acc, i) => acc + i.amount, 0);

    // Despesas à vista do mês
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { category: true, account: true, creditCard: true }
    });
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    // Parcelas de Cartão do mês
    const installments = await prisma.installment.findMany({
      where: {
        cardPurchase: { creditCard: { userId } },
        dueDate: { gte: startDate, lte: endDate }
      },
      include: { cardPurchase: { include: { creditCard: true } } }
    });
    const totalInstallments = installments.reduce((acc, inst) => acc + inst.amount, 0);

    const grandTotalExpenses = totalExpenses + totalInstallments;
    const netSavings = totalIncomes - grandTotalExpenses;

    // Gastos por Categoria no Mês
    const categoryTotals = {};
    expenses.forEach(e => {
      const catName = e.category ? e.category.name : 'Outros';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + e.amount;
    });
    installments.forEach(inst => {
      const catName = inst.cardPurchase.categoryName || 'Outros';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + inst.amount;
    });

    const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      amount: categoryTotals[cat]
    })).sort((a, b) => b.amount - a.amount);

    return res.json({
      month,
      year,
      totalBalance,
      totalIncomes,
      totalExpenses: grandTotalExpenses,
      netSavings,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return res.status(500).json({ error: 'Erro ao carregar resumo financeiro' });
  }
});

// ACCOUNTS
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({ where: { userId: req.userId } });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar contas' });
  }
});

router.post('/accounts', async (req, res) => {
  try {
    const { name, type, balance, color } = req.body;
    const account = await prisma.account.create({
      data: {
        userId: req.userId,
        name,
        type: type || 'CHECKING',
        balance: parseFloat(balance) || 0.0,
        color: color || '#3b82f6'
      }
    });
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// CATEGORIES
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ where: { userId: req.userId } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// INCOMES (RECEITAS)
router.get('/incomes', async (req, res) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: req.userId },
      include: { category: true, account: true },
      orderBy: { date: 'desc' }
    });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar receitas' });
  }
});

router.post('/incomes', async (req, res) => {
  try {
    const { description, amount, date, categoryId, accountId } = req.body;
    const numAmount = parseFloat(amount);

    const income = await prisma.income.create({
      data: {
        userId: req.userId,
        description,
        amount: numAmount,
        date: new Date(date),
        categoryId: categoryId || null,
        accountId: accountId || null
      },
      include: { category: true, account: true }
    });

    if (accountId) {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: numAmount } }
      });
    }

    res.status(201).json(income);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar receita' });
  }
});

router.delete('/incomes/:id', async (req, res) => {
  try {
    const income = await prisma.income.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!income) return res.status(404).json({ error: 'Receita não encontrada' });

    // Estornar valor da conta se houver conta vinculada
    if (income.accountId) {
      await prisma.account.update({
        where: { id: income.accountId },
        data: { balance: { decrement: income.amount } }
      });
    }

    await prisma.income.delete({ where: { id: req.params.id } });
    res.json({ message: 'Receita excluída com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir receita' });
  }
});

// EXPENSES (DESPESAS)
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      include: { category: true, account: true, creditCard: true },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar despesas' });
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const { description, amount, date, paymentMethod, categoryId, accountId, creditCardId } = req.body;
    const numAmount = parseFloat(amount);

    const expense = await prisma.expense.create({
      data: {
        userId: req.userId,
        description,
        amount: numAmount,
        date: new Date(date),
        paymentMethod: paymentMethod || 'MONEY',
        categoryId: categoryId || null,
        accountId: accountId || null,
        creditCardId: creditCardId || null
      },
      include: { category: true, account: true, creditCard: true }
    });

    if (accountId) {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { decrement: numAmount } }
      });
    }

    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar despesa' });
  }
});

router.delete('/expenses/:id', async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!expense) return res.status(404).json({ error: 'Despesa não encontrada' });

    // Devolver valor à conta se foi debitado de uma conta
    if (expense.accountId) {
      await prisma.account.update({
        where: { id: expense.accountId },
        data: { balance: { increment: expense.amount } }
      });
    }

    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ message: 'Despesa excluída com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir despesa' });
  }
});

// RECURRING EXPENSES (CONTAS RECORRENTES)
router.get('/recurring', async (req, res) => {
  try {
    const recurring = await prisma.recurringExpense.findMany({
      where: { userId: req.userId }
    });
    res.json(recurring);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar contas recorrentes' });
  }
});

router.post('/recurring', async (req, res) => {
  try {
    const { description, amount, dueDay, categoryName } = req.body;
    const recurring = await prisma.recurringExpense.create({
      data: {
        userId: req.userId,
        description,
        amount: parseFloat(amount),
        dueDay: parseInt(dueDay),
        categoryName: categoryName || 'Contas'
      }
    });
    res.status(201).json(recurring);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar conta recorrente' });
  }
});

router.delete('/recurring/:id', async (req, res) => {
  try {
    const item = await prisma.recurringExpense.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!item) return res.status(404).json({ error: 'Conta recorrente não encontrada' });

    await prisma.recurringExpense.delete({ where: { id: req.params.id } });
    res.json({ message: 'Conta fixa removida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover conta fixo' });
  }
});

// CREDIT CARDS
router.get('/cards', async (req, res) => {
  try {
    const cards = await prisma.creditCard.findMany({
      where: { userId: req.userId },
      include: {
        purchases: {
          include: { installmentItems: true }
        }
      }
    });

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const result = cards.map(card => {
      let currentInvoice = 0;
      let totalCommitted = 0;

      card.purchases.forEach(p => {
        p.installmentItems.forEach(inst => {
          const instDate = new Date(inst.dueDate);
          const instMonth = instDate.getMonth() + 1;
          const instYear = instDate.getFullYear();

          if (instYear > currentYear || (instYear === currentYear && instMonth >= currentMonth)) {
            totalCommitted += inst.amount;
          }

          if (instMonth === currentMonth && instYear === currentYear) {
            currentInvoice += inst.amount;
          }
        });
      });

      return {
        id: card.id,
        name: card.name,
        limit: card.limit,
        closingDay: card.closingDay,
        dueDay: card.dueDay,
        color: card.color,
        currentInvoice,
        availableLimit: Math.max(0, card.limit - totalCommitted)
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar cartões de crédito' });
  }
});

router.post('/cards', async (req, res) => {
  try {
    const { name, limit, closingDay, dueDay, color } = req.body;
    const card = await prisma.creditCard.create({
      data: {
        userId: req.userId,
        name,
        limit: parseFloat(limit),
        closingDay: parseInt(closingDay),
        dueDay: parseInt(dueDay),
        color: color || '#8b5cf6'
      }
    });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar cartão' });
  }
});

router.post('/cards/purchases', async (req, res) => {
  try {
    const { creditCardId, description, totalAmount, installments, purchaseDate, categoryName } = req.body;

    const numAmount = parseFloat(totalAmount);
    const numInstallments = parseInt(installments) || 1;
    const installmentValue = numAmount / numInstallments;
    const startDate = new Date(purchaseDate);

    const cardPurchase = await prisma.cardPurchase.create({
      data: {
        creditCardId,
        description,
        totalAmount: numAmount,
        installments: numInstallments,
        purchaseDate: startDate,
        categoryName: categoryName || 'Outros'
      }
    });

    const installmentRecords = [];
    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);

      installmentRecords.push({
        cardPurchaseId: cardPurchase.id,
        number: i + 1,
        amount: installmentValue,
        dueDate
      });
    }

    await prisma.installment.createMany({
      data: installmentRecords
    });

    res.status(201).json({ message: 'Compra parcelada lançada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar compra parcelada' });
  }
});

router.get('/cards/projection', async (req, res) => {
  try {
    const installments = await prisma.installment.findMany({
      where: {
        cardPurchase: {
          creditCard: { userId: req.userId }
        }
      },
      include: {
        cardPurchase: { include: { creditCard: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    const monthlyProjection = {};
    const monthsNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    installments.forEach(inst => {
      const d = new Date(inst.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthsNames[d.getMonth()]} ${d.getFullYear()}`;

      if (!monthlyProjection[key]) {
        monthlyProjection[key] = { key, label, totalAmount: 0, items: [] };
      }

      monthlyProjection[key].totalAmount += inst.amount;
      monthlyProjection[key].items.push({
        description: inst.cardPurchase.description,
        cardName: inst.cardPurchase.creditCard.name,
        installment: `${inst.number}/${inst.cardPurchase.installments}`,
        amount: inst.amount
      });
    });

    const projectionList = Object.values(monthlyProjection).sort((a, b) => a.key.localeCompare(b.key));

    res.json(projectionList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar projeção de parcelas' });
  }
});

// GOALS (METAS FINANCIALS)
router.get('/goals', async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId }
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar metas' });
  }
});

router.post('/goals', async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, targetDate, icon, color } = req.body;
    const goal = await prisma.goal.create({
      data: {
        userId: req.userId,
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0.0,
        targetDate: targetDate ? new Date(targetDate) : null,
        icon: icon || 'Target',
        color: color || '#10b981'
      }
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar meta' });
  }
});

router.patch('/goals/:id/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        currentAmount: { increment: parseFloat(amount) }
      }
    });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar saldo da meta' });
  }
});

// BUDGETS (ORÇAMENTOS MENSÁIS POR CATEGORIA)
router.get('/budgets', async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId, month, year },
      include: { category: true }
    });

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        date: { gte: startDate, lte: endDate }
      }
    });

    const result = budgets.map(b => {
      const spent = expenses
        .filter(e => e.categoryId === b.categoryId)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        id: b.id,
        category: b.category.name,
        categoryId: b.categoryId,
        limit: b.limit,
        spent,
        percentage: Math.min(100, Math.round((spent / b.limit) * 100))
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar orçamentos' });
  }
});

router.post('/budgets', async (req, res) => {
  try {
    const { categoryId, limit, month, year } = req.body;
    const now = new Date();
    const m = parseInt(month) || now.getMonth() + 1;
    const y = parseInt(year) || now.getFullYear();

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: req.userId,
          categoryId,
          month: m,
          year: y
        }
      },
      update: { limit: parseFloat(limit) },
      create: {
        userId: req.userId,
        categoryId,
        limit: parseFloat(limit),
        month: m,
        year: y
      },
      include: { category: true }
    });

    res.status(201).json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao definir orçamento' });
  }
});

// REPORTS & METRICS (RELATÓRIOS E COMPARAÇÃO MENSAL)
router.get('/reports/monthly-comparison', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const months = [];

    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const monthName = d.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const incomes = await prisma.income.aggregate({
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      });

      const expenses = await prisma.expense.aggregate({
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      });

      const installments = await prisma.installment.aggregate({
        where: {
          cardPurchase: { creditCard: { userId } },
          dueDate: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      });

      const inc = incomes._sum.amount || 0;
      const exp = (expenses._sum.amount || 0) + (installments._sum.amount || 0);

      months.push({
        monthName,
        month,
        year,
        receitas: inc,
        despesas: exp,
        saldo: inc - exp
      });
    }

    res.json(months);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório comparativo' });
  }
});

// ALERTAS INTELIGENTES
router.get('/alerts', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const alerts = [];

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const budgets = await prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
      include: { category: true }
    });

    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } }
    });

    budgets.forEach(b => {
      const spent = expenses
        .filter(e => e.categoryId === b.categoryId)
        .reduce((sum, e) => sum + e.amount, 0);

      const pct = (spent / b.limit) * 100;
      if (pct >= 80) {
        alerts.push({
          type: pct >= 100 ? 'DANGER' : 'WARNING',
          message: `Você já gastou ${pct.toFixed(0)}% do orçamento de ${b.category.name} (R$ ${spent.toFixed(2)} de R$ ${b.limit.toFixed(2)}).`
        });
      }
    });

    const currentDay = now.getDate();
    const recurrings = await prisma.recurringExpense.findMany({
      where: { userId, active: true }
    });

    recurrings.forEach(r => {
      const diffDays = r.dueDay - currentDay;
      if (diffDays >= 0 && diffDays <= 5) {
        const textDate = diffDays === 0 ? 'hoje' : diffDays === 1 ? 'amanhã' : `em ${diffDays} dias`;
        alerts.push({
          type: 'INFO',
          message: `Sua conta "${r.description}" de R$ ${r.amount.toFixed(2)} vence ${textDate} (dia ${r.dueDay}).`
        });
      }
    });

    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar alertas' });
  }
});

module.exports = router;
