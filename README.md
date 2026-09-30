# 💰 Meu Financeiro — Controle Financeiro Pessoal Inteligente

![Meu Financeiro Dashboard](https://img.shields.io/badge/Status-Conclu%C3%ADdo-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20Tailwind%20%7C%20Prisma-8b5cf6?style=for-the-badge)

O **Meu Financeiro** é um sistema completo de controle financeiro pessoal desenvolvido com arquitetura **Fullstack moderna (Node.js + Express + React + Tailwind CSS + Prisma ORM)**. 

O principal diferencial da aplicação não é apenas anotar gastos, mas **ajudar a pessoa a entender para onde o dinheiro está indo**, fornecendo alertas inteligentes, simulação e projeção de parcelas de cartão de crédito mês a mês, acompanhamento de metas com progresso visual e orçamentos teto por categoria.

---

## 📱 Visualização do Aplicativo

<div align="center">
  <h3>Interface Moderna & Adaptada para Dispositivos Móveis (Mobile-First)</h3>
  <p>Projetado para uma navegação fluida, confortável e ágil direto do celular ou computador.</p>
</div>

---

## 🌟 Principais Funcionalidades

### 🏠 1. Dashboard Inteligente
- **Visão Geral:** Saldo disponível total acumulado em conta, entradas (receitas do mês), saídas (despesas do mês) e balanço líquido mensal.
- **Gastos por Categoria:** Tabela detalhada e gráfico de rosca interativo com a proporção exata de cada tipo de despesa.

### 💵 2. Registrar Receitas
- Cadastro de rendas com valor, categoria (*Salário, Freelance, Comissão, Venda, Renda Extra, Outros*), data e vinculação à conta bancária de destino.
- Incremento automático e instantâneo no saldo da conta.

### 💸 3. Registrar Despesas
- Suporte a múltiplas formas de pagamento: **Débito em Conta**, **PIX / Dinheiro** ou **Cartão de Crédito**.
- Estorno automático do saldo da conta ao excluir uma despesa.

### 💳 4. Controle de Cartões & Compras Parceladas (Diferencial)
- Cadastro de cartões de crédito com limite total, limite disponível, fatura atual e dia de vencimento/fechamento.
- **Lançamento de Compras Parceladas (ex: Notebook em 10x):** O sistema calcula e distribui o valor exato das parcelas nos meses subsequentes.
- **Projeção de Faturas Futuras:** Visualização cronológica dos compromissos já assumidos para os próximos meses.

### 📅 5. Contas Fixas Recorrentes
- Gestão de contas fixas mensais (*Aluguel, Internet, Netflix, Academia, Celular*) com dia fixo de vencimento.

### 🎯 6. Metas Financeiras
- Definição de objetivos (*Viagem, Computador, Reserva de Emergência*).
- Barra de progresso dinâmica em porcentagem, mostrando quanto foi guardado, o objetivo e o valor restante.
- Botão rápido para novos depósitos na meta.

### 📈 7. Orçamento Mensal por Categoria
- Definição de limite teto desejado por categoria (ex: *"Não gastar mais de R$ 600 em Alimentação"*).
- Indicadores visuais de consumo com mudança de cor (*Verde, Amarelo, Vermelho*).

### 📊 8. Relatórios e Comparativo Histórico
- Tabela e gráfico comparativo de barras referente aos últimos meses (*Julho vs Agosto vs Setembro*).

### ⚠️ 9. Central de Alertas Inteligentes
- Notificações no topo do Dashboard sobre estouro de orçamento e contas próximas do vencimento.

### 🔐 10. Autenticação e Segurança
- Cadastro e login com criptografia de senha (**bcryptjs**) e autenticação via **JWT**.
- Isolamento total de dados por usuário.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **[React](https://react.dev/):** Biblioteca principal de interface.
- **[Vite](https://vitejs.dev/):** Bundler e servidor de desenvolvimento ultra-rápido.
- **[Tailwind CSS v4](https://tailwindcss.com/):** Estilização moderna e responsiva.
- **[Lucide React](https://lucide.dev/):** Ícones modernos.
- **[Recharts](https://recharts.org/):** Gráficos interativos para análise de dados.
- **[Axios](https://axios-http.com/):** Cliente HTTP para integração de APIs.

### **Backend & Banco de Dados**
- **[Node.js](https://nodejs.org/):** Ambiente de execução JavaScript.
- **[Express](https://expressjs.com/):** Framework para rotas e APIs RESTful.
- **[Prisma ORM](https://www.prisma.io/):** Mapeamento relacional de dados.
- **[PostgreSQL / SQLite](https://www.postgresql.org/):** Banco de dados relacional.
- **[JSON Web Token (JWT)](https://jwt.io/):** Controle de sessões seguras.
- **[Bcrypt.js](https://github.com/dcodeIO/bcrypt.js):** Hash de senhas.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**

### Passo a passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/leiddyy/Controle-Finaceiro.git
   cd Controle-Finaceiro
   ```

2. **Instalar as dependências:**
   ```bash
   npm run build
   ```

3. **Configurar as variáveis de ambiente (`.env`):**
   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="sua_chave_secreta_aqui"
   PORT=5000
   ```

4. **Gerar as tabelas no Banco de Dados:**
   ```bash
   npx prisma db push
   ```

5. **Iniciar o aplicativo em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acessar a aplicação:**
   Abra no seu navegador em: **`http://localhost:5173`** (ou `http://localhost:5000`).

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Desenvolvido com 💚 por <strong>Leidiane Silva</strong>
</div>
