import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ArrowDownRight, Calendar, Tag, CreditCard as AccountIcon, Trash2 } from 'lucide-react';

export function ExpensesView() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('DEBIT');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [creditCardId, setCreditCardId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [expRes, catRes, accRes, cardRes] = await Promise.all([
        api.get('/finance/expenses'),
        api.get('/finance/categories'),
        api.get('/finance/accounts'),
        api.get('/finance/cards')
      ]);
      setExpenses(expRes.data);
      const expCats = catRes.data.filter(c => c.type === 'EXPENSE');
      setCategories(expCats);
      setAccounts(accRes.data);
      setCards(cardRes.data);

      if (expCats.length > 0) setCategoryId(expCats[0].id);
      if (accRes.data.length > 0) setAccountId(accRes.data[0].id);
      if (cardRes.data.length > 0) setCreditCardId(cardRes.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/finance/expenses', {
        description,
        amount,
        date,
        paymentMethod,
        categoryId,
        accountId: paymentMethod !== 'CREDIT' ? accountId : null,
        creditCardId: paymentMethod === 'CREDIT' ? creditCardId : null
      });
      setDescription('');
      setAmount('');
      loadData();
    } catch (err) {
      alert('Erro ao salvar despesa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta despesa? Se foi débito ou pix, o saldo da conta será estornado.')) return;
    try {
      await api.delete(`/finance/expenses/${id}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir despesa');
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulário Nova Despesa */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">NOVA DESPESA</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Mercado, Farmácia"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="DEBIT">Cartão de Débito / Conta</option>
              <option value="MONEY">Dinheiro / PIX</option>
              <option value="CREDIT">Cartão de Crédito</option>
            </select>
          </div>

          {paymentMethod !== 'CREDIT' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Conta de Origem</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} (Saldo: {formatMoney(a.balance)})</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cartão de Crédito</label>
              <select
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              >
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>{card.name} (Limite Disp: {formatMoney(card.availableLimit)})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {saving ? 'Salvando...' : 'SALVAR DESPESA'}
          </button>
        </form>
      </div>

      {/* Lista de Despesas */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Despesas Registradas</h3>

        {loading ? (
          <p className="text-slate-500 text-sm">Carregando despesas...</p>
        ) : expenses.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhuma despesa cadastrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-white font-semibold text-sm truncate">{exp.description}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-red-400 font-bold text-sm sm:text-base">
                      - {formatMoney(exp.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      title="Excluir despesa"
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-xs">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-red-400" />
                    {exp.category?.name || 'Geral'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(exp.date).toLocaleDateString('pt-BR')}
                  </span>
                  {exp.account && (
                    <span className="flex items-center gap-1">
                      <AccountIcon className="w-3 h-3 text-blue-400" />
                      {exp.account.name}
                    </span>
                  )}
                  {exp.creditCard && (
                    <span className="flex items-center gap-1">
                      <AccountIcon className="w-3 h-3 text-purple-400" />
                      {exp.creditCard.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
