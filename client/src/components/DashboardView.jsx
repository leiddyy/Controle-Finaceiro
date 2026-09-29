import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#6b7280', '#10b981', '#8b5cf6', '#14b8a6'];

export function DashboardView({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const now = new Date();
        const [sumRes, alertRes] = await Promise.all([
          api.get(`/finance/summary?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
          api.get('/finance/alerts')
        ]);
        setSummary(sumRes.data);
        setAlerts(alertRes.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Carregando painel financeiro...</div>;
  }

  const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Alertas Inteligentes */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((al, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
                al.type === 'DANGER'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : al.type === 'WARNING'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}
            >
              {al.type === 'INFO' ? (
                <Bell className="w-5 h-5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <span>{al.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Card Principal - Saldo Disponível */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Disponível em Conta</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              {formatMoney(summary.totalBalance)}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('incomes')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              Nova Receita
            </button>
            <button
              onClick={() => onNavigate('expenses')}
              className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-500/10"
            >
              <Plus className="w-4 h-4" />
              Nova Despesa
            </button>
          </div>
        </div>

        {/* Resumo Triplo: Receitas, Despesas, Economia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Receitas (Entradas do Mês)</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-400 mt-2">{formatMoney(summary.totalIncomes)}</p>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Despesas (Saídas do Mês)</span>
              <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-red-400 mt-2">{formatMoney(summary.totalExpenses)}</p>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Balanço do Mês (Receitas - Despesas)</span>
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-xl font-bold mt-2 ${summary.netSavings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatMoney(summary.netSavings)}
            </p>
          </div>
        </div>
      </div>

      {/* Gastos por Categoria e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Gastos por Categoria (Mês Atual)</h3>
          {summary.categoryBreakdown.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum gasto registrado neste mês.</p>
          ) : (
            <div className="space-y-4">
              {summary.categoryBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-300 font-medium text-sm">{item.category}</span>
                  </div>
                  <span className="text-white font-bold text-sm">{formatMoney(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center min-h-[300px]">
          <h3 className="text-lg font-bold text-white mb-2 self-start">Distribuição Visual</h3>
          {summary.categoryBreakdown.length === 0 ? (
            <p className="text-slate-500 text-sm">Sem dados para exibição do gráfico neste mês.</p>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {summary.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
