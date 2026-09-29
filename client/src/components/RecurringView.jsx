import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, RefreshCw, CheckCircle2, Trash2 } from 'lucide-react';

export function RecurringView() {
  const [recurringList, setRecurringList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('10');
  const [categoryName, setCategoryName] = useState('Contas');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.get('/finance/recurring');
      setRecurringList(res.data);
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
      await api.post('/finance/recurring', {
        description,
        amount,
        dueDay,
        categoryName
      });
      setDescription('');
      setAmount('');
      loadData();
    } catch (err) {
      alert('Erro ao criar conta recorrente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir esta conta fixa recorrente?')) return;
    try {
      await api.delete(`/finance/recurring/${id}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir conta fixa');
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cadastrar Conta Recorrente */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">NOVA CONTA FIXA</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Aluguel, Netflix, Internet"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Valor Fixo (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="100,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Dia de Vencimento Fixo</label>
            <input
              type="number"
              min="1"
              max="31"
              required
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
          >
            {saving ? 'Salvando...' : 'SALVAR CONTA FIXA'}
          </button>
        </form>
      </div>

      {/* Lista de Contas Recorrentes */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Contas Fixas Cadastradas</h3>

        {loading ? (
          <p className="text-slate-500 text-sm">Carregando contas recorrentes...</p>
        ) : recurringList.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhuma conta fixa cadastrada.</p>
        ) : (
          <div className="space-y-3">
            {recurringList.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold text-sm">{item.description}</h4>
                  <span className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    Vence todo dia {item.dueDay}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-amber-400 font-bold text-base block">{formatMoney(item.amount)}</span>
                    <span className="text-emerald-400 text-xs flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Recorrente mensal
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Excluir conta fixa"
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
