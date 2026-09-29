import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export function ReportsView() {
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.get('/finance/reports/monthly-comparison');
        setComparisonData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          RELATÓRIOS E COMPARAÇÃO MENSAL
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Acompanhe a evolução do seu saldo e comparativo de Receitas vs Despesas dos últimos meses.
        </p>

        {loading ? (
          <p className="text-slate-500 text-sm">Carregando relatório...</p>
        ) : (
          <>
            {/* Tabela de Comparação */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Mês</th>
                    <th className="py-3 px-4 text-emerald-400">Receitas</th>
                    <th className="py-3 px-4 text-red-400">Despesas</th>
                    <th className="py-3 px-4 text-blue-400">Saldo Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm font-medium">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{row.monthName} {row.year}</td>
                      <td className="py-3 px-4 text-emerald-400">{formatMoney(row.receitas)}</td>
                      <td className="py-3 px-4 text-red-400">{formatMoney(row.despesas)}</td>
                      <td className={`py-3 px-4 font-bold ${row.saldo >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {formatMoney(row.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Gráfico Comparativo de Barras */}
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="monthName" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val) => formatMoney(val)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
