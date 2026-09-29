import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, Calendar, Tag, CreditCard as AccountIcon, Trash2 } from 'lucide-react';

export function IncomesView() {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [incRes, catRes, accRes] = await Promise.all([
        api.get('/finance/incomes'),
        api.get('/finance/categories'),
        api.get('/finance/accounts')
      ]);
      setIncomes(incRes.data);
      const incCats = catRes.data.filter(c => c.type === 'INCOME');
      setCategories(incCats);
      setAccounts(accRes.data);

      if (incCats.length > 0) setCategoryId(incCats[0].id);
      if (accRes.data.length > 0) setAccountId(accRes.data[0].id);
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
      await api.post('/finance/incomes', {
        description,
        amount,
        date,
        categoryId,
        accountId
      });
      setDescription('');
      setAmount('');
      loadData();
    } catch (err) {
      alert('Erro ao salvar receita');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta receita? O saldo creditado na conta será estornado.')) return;
    try {
      await api.delete(`/finance/incomes/${id}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir receita');
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulário Cadastrar Receita */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">NOVA RECEITA</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Salário, Freelance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Conta de Destino</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} (Saldo: {formatMoney(a.balance)})</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {saving ? 'Salvando...' : 'SALVAR RECEITA'}
          </button>
        </form>
      </div>

      {/* Lista de Receitas */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Receitas Cadastradas</h3>

        {loading ? (
          <p className="text-slate-500 text-sm">Carregando receitas...</p>
        ) : incomes.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhuma receita cadastrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {incomes.map((inc) => (
              <div key={inc.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-white font-semibold text-sm truncate">{inc.description}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-emerald-400 font-bold text-sm sm:text-base">
                      + {formatMoney(inc.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(inc.id)}
                      title="Excluir receita"
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-xs">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-400" />
                    {inc.category?.name || 'Geral'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(inc.date).toLocaleDateString('pt-BR')}
                  </span>
                  {inc.account && (
                    <span className="flex items-center gap-1">
                      <AccountIcon className="w-3 h-3 text-blue-400" />
                      {inc.account.name}
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
