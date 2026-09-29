import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, Plus, DollarSign } from 'lucide-react';

export function GoalsView() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form de Criar Meta
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // Deposit modal
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositValue, setDepositValue] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.get('/finance/goals');
      setGoals(res.data);
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
      await api.post('/finance/goals', { title, targetAmount, currentAmount });
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      loadData();
    } catch (err) {
      alert('Erro ao criar meta');
    } finally {
      setSaving(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/finance/goals/${depositGoalId}/deposit`, { amount: depositValue });
      setDepositGoalId(null);
      setDepositValue('');
      loadData();
    } catch (err) {
      alert('Erro ao guardar valor na meta');
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cadastrar Nova Meta */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">CRIAR META</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Título da Meta</label>
            <input
              type="text"
              required
              placeholder="Ex: Comprar computador, Viagem"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Valor Objetivo (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="4000,00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Já Guardado (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="1500,00"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all cursor-pointer mt-2"
          >
            {saving ? 'Salvando...' : 'CRIAR META'}
          </button>
        </form>
      </div>

      {/* Lista de Metas */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Minhas Metas Financeiras</h3>

        {loading ? (
          <p className="text-slate-500 text-sm">Carregando metas...</p>
        ) : goals.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
            Nenhuma meta criada ainda. Defina seus objetivos financeiros acima!
          </div>
        ) : (
          goals.map((g) => {
            const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-bold text-lg">{g.title}</h4>
                    <div className="flex gap-4 text-xs text-slate-400 mt-1">
                      <span>Objetivo: <strong className="text-white">{formatMoney(g.targetAmount)}</strong></span>
                      <span>Guardado: <strong className="text-teal-400">{formatMoney(g.currentAmount)}</strong></span>
                      <span>Faltam: <strong className="text-amber-400">{formatMoney(remaining)}</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDepositGoalId(g.id)}
                    className="px-3 py-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Guardar +
                  </button>
                </div>

                {/* Barra de Progresso Visual */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Progresso</span>
                    <span className="text-teal-400">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Guardar Dinheiro */}
      {depositGoalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Guardar Dinheiro na Meta</h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Valor a Adicionar (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="250,00"
                  value={depositValue}
                  onChange={(e) => setDepositValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-teal-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-teal-500/20"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
