import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sliders, CheckCircle, AlertTriangle } from 'lucide-react';

export function BudgetsView() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [bRes, cRes] = await Promise.all([
        api.get('/finance/budgets'),
        api.get('/finance/categories')
      ]);
      setBudgets(bRes.data);
      const expCats = cRes.data.filter(c => c.type === 'EXPENSE');
      setCategories(expCats);
      if (expCats.length > 0) setCategoryId(expCats[0].id);
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
      await api.post('/finance/budgets', { categoryId, limit });
      setLimit('');
      loadData();
    } catch (err) {
      alert('Erro ao definir orçamento');
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Definir Limite de Orçamento */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">ORÇAMENTO MENSAL</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Categoria de Gasto</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Limite Teto Desejado (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="Ex: 600,00"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer mt-2"
          >
            {saving ? 'Salvando...' : 'DEFINIR LIMITE'}
          </button>
        </form>
      </div>

      {/* Lista de Orçamentos e Barras de Progresso */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Acompanhamento do Mês Atual</h3>

        {loading ? (
          <p className="text-slate-500 text-sm">Carregando orçamentos...</p>
        ) : budgets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
            Nenhum limite de orçamento definido. Defina limites por categoria para controlar seus gastos!
          </div>
        ) : (
          budgets.map((b) => {
            const isDanger = b.percentage >= 100;
            const isWarning = b.percentage >= 80 && !isDanger;

            return (
              <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-base">{b.category}</span>
                  <div className="text-right text-xs">
                    <span className="text-slate-400">Limite: </span>
                    <strong className="text-white">{formatMoney(b.limit)}</strong>
                    <span className="text-slate-400 ml-2"> | Gasto: </span>
                    <strong className={isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                      {formatMoney(b.spent)}
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      {isDanger && <span className="text-red-400 text-xs">⚠️ Limite estourado!</span>}
                      {isWarning && <span className="text-amber-400 text-xs">⚠️ Atenção próximo do limite</span>}
                    </span>
                    <span className={isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                      {b.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
