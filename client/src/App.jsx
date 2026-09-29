import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './components/DashboardView';
import { IncomesView } from './components/IncomesView';
import { ExpensesView } from './components/ExpensesView';
import { CardsView } from './components/CardsView';
import { RecurringView } from './components/RecurringView';
import { GoalsView } from './components/GoalsView';
import { BudgetsView } from './components/BudgetsView';
import { ReportsView } from './components/ReportsView';
import {
  Wallet,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CreditCard,
  RefreshCw,
  Target,
  Sliders,
  BarChart3,
  LogOut,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const { signed, user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Carregando aplicativo...
      </div>
    );
  }

  if (!signed) {
    return <LoginModal />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incomes', label: 'Receitas', icon: TrendingUp },
    { id: 'expenses', label: 'Despesas', icon: TrendingDown },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'recurring', label: 'Contas Fixas', icon: RefreshCw },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'budgets', label: 'Orçamento', icon: Sliders },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      {/* Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-extrabold text-base md:text-lg tracking-wider text-white">MEU FINANCEIRO</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[100px] truncate">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 shadow-2xl animate-in slide-in-from-top duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 flex-1 w-full flex flex-col md:flex-row gap-6">
        {/* Desktop Navigation Sidebar */}
        <aside className="hidden md:block w-64 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl shrink-0 h-fit space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full overflow-hidden">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => handleSelectTab(tab)} />}
          {activeTab === 'incomes' && <IncomesView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'cards' && <CardsView />}
          {activeTab === 'recurring' && <RecurringView />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'budgets' && <BudgetsView />}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Bottom Bar Navigation for Mobile (Estilo Aplicativo Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 px-2 py-2 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
