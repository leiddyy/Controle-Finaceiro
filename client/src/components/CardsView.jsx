import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, Calendar, Plus, CalendarRange, CheckCircle2 } from 'lucide-react';

export function CardsView() {
  const [cards, setCards] = useState([]);
  const [projections, setProjections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form de Novo Cartão
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('5');
  const [dueDay, setDueDay] = useState('10');
  const [color, setColor] = useState('#8b5cf6');
  const [showCardModal, setShowCardModal] = useState(false);

  // Form de Compra Parcelada
  const [selectedCardId, setSelectedCardId] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [installments, setInstallments] = useState('1');
  const [categoryName, setCategoryName] = useState('Compras');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [savingPurchase, setSavingPurchase] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cardsRes, projRes] = await Promise.all([
        api.get('/finance/cards'),
        api.get('/finance/cards/projection')
      ]);
      setCards(cardsRes.data);
      setProjections(projRes.data);
      if (cardsRes.data.length > 0) setSelectedCardId(cardsRes.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/cards', { name, limit, closingDay, dueDay, color });
      setName('');
      setLimit('');
      setShowCardModal(false);
      loadData();
    } catch (err) {
      alert('Erro ao criar cartão');
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCardId) return alert('Cadastre um cartão primeiro!');
    setSavingPurchase(true);
    try {
      await api.post('/finance/cards/purchases', {
        creditCardId: selectedCardId,
        description,
        totalAmount,
        installments,
        purchaseDate,
        categoryName
      });
      setDescription('');
      setTotalAmount('');
      setInstallments('1');
      loadData();
    } catch (err) {
      alert('Erro ao registrar compra parcelada');
    } finally {
      setSavingPurchase(false);
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8">
      {/* Topo: Cartões de Crédito */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            MEUS CARTÕES DE CRÉDITO
          </h2>
          <button
            onClick={() => setShowCardModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Cartão
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
            Nenhum cartão cadastrado ainda. Clique em "Cadastrar Cartão" para começar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg text-white">{c.name}</span>
                  <span className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
                    Vencimento Dia {c.dueDay}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Limite Total:</span>
                    <span className="text-white font-semibold">{formatMoney(c.limit)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fatura Atual:</span>
                    <span className="text-red-400 font-bold">{formatMoney(c.currentInvoice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Limite Disponível:</span>
                    <span className="text-emerald-400 font-bold">{formatMoney(c.availableLimit)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-500 flex justify-between">
                  <span>Fechamento da fatura: Dia {c.closingDay}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção Principal: Registro de Compra Parcelada & Projeção */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Compra Parcelada */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-md font-bold text-white mb-4">REGISTRAR COMPRA PARCELADA</h3>

          <form onSubmit={handlePurchaseSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Selecione o Cartão</label>
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Descrição do Item</label>
              <input
                type="text"
                required
                placeholder="Ex: Notebook, Celular, Viagem"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="3000,00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nº de Parcelas</label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  required
                  placeholder="10"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Data da Compra</label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingPurchase || cards.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer mt-2"
            >
              {savingPurchase ? 'Processando...' : 'LANÇAR COMPRA PARCELADA'}
            </button>
          </form>
        </div>

        {/* Projeção de Parcelas Mês a Mês */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-purple-400" />
            COMPROMISSOS NOS PRÓXIMOS MESES
          </h3>

          {projections.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhuma parcela futura agendada.</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {projections.map((proj) => (
                <div key={proj.key} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
                    <span className="font-bold text-white text-base uppercase">{proj.label}</span>
                    <span className="text-purple-400 font-extrabold text-base">
                      {formatMoney(proj.totalAmount)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {proj.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-300">
                        <span>
                          {item.description} ({item.cardName}) - <strong className="text-purple-400">{item.installment}</strong>
                        </span>
                        <span className="font-semibold">{formatMoney(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Cadastro de Cartão */}
      {showCardModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">CADASTRAR NOVO CARTÃO</h3>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome do Cartão (ex: Nubank, Inter)</label>
                <input
                  type="text"
                  required
                  placeholder="Nubank"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Limite Total (R$)</label>
                <input
                  type="number"
                  required
                  placeholder="2000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Dia Fechamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
