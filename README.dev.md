# Guia de Desenvolvimento Local

## Como Funciona

### Desenvolvimento Local (Bolt/localhost)
- Vite roda na porta **5173** (padrão)
- Proxy configurado no `vite.config.ts` redireciona `/api` → Google Apps Script
- Variáveis de ambiente carregadas do `.env`
- Sem necessidade de Serverless Function local

### Produção (Vercel)
- Serverless Function em `/api/index.js`
- `vercel.json` redireciona `/api/*` para a function
- Variáveis de ambiente configuradas na Vercel
- Function atua como proxy para Google Apps Script

---

## Setup Local

### 1. Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Certifique-se de que o arquivo `.env` contém:
```env
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/SEU_SCRIPT_ID/exec
API_KEY=sua_chave_api_aqui
```

### 4. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:5173`

---

## Estrutura de Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing Page |
| `/cardapio` | Cardápio Digital |
| `/checkout` | Finalização de Pedido |
| `/cozinha` | Painel da Cozinha |

---

## Testando a API

### Via Navegador
Abra no navegador:
```
http://localhost:5173/api?action=getConfig
```

### Logs do Proxy
O terminal mostrará logs do proxy:
```
[DEV PROXY] GET /?action=getConfig&key=...
[DEV PROXY] Response: 200 /api?action=getConfig
```

---

## Troubleshooting

### Erro 404 em /api
**Causa:** Proxy não está funcionando ou variáveis de ambiente não carregadas

**Solução:**
1. Verifique se `GOOGLE_SCRIPT_URL` está no `.env`
2. Reinicie o servidor: `Ctrl+C` e depois `npm run dev`
3. Verifique os logs no terminal

### Erro de CORS
**Causa:** Google Apps Script não aceita origem `localhost:5173`

**Solução:**
1. Configure o Google Apps Script para aceitar todas as origens
2. Ou use a configuração de proxy (já implementada)

### Carrinho não persiste
**Causa:** localStorage limpo ou erro de serialização

**Solução:**
1. Abra DevTools → Application → Local Storage
2. Verifique se existe `carrinho` com dados válidos
3. Limpe o localStorage: `localStorage.clear()` no console

### Build falha
**Causa:** Erros de TypeScript ou dependências faltando

**Solução:**
```bash
npm run typecheck  # Verifica erros de TypeScript
npm install        # Reinstala dependências
npm run build      # Tenta build novamente
```

---

## Diferenças entre Dev e Produção

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| Servidor | Vite (porta 5173) | Vercel |
| API | Proxy do Vite → Google Script | Serverless Function → Google Script |
| Hot Reload | Sim | Não |
| Build | Não necessário | Necessário |
| Variáveis ENV | `.env` local | Vercel Dashboard |

---

## Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build de produção
npm run lint         # Executa ESLint
npm run typecheck    # Verifica tipos TypeScript
```

---

## Estrutura do Projeto

```
project/
├── api/
│   └── index.js              # Serverless Function (Vercel)
├── src/
│   ├── components/           # Componentes React
│   ├── hooks/                # Hooks customizados
│   ├── pages/                # Páginas da aplicação
│   ├── services/             # Serviços (API, Google Sheets)
│   ├── types/                # Tipos TypeScript
│   └── App.tsx               # Componente principal
├── public/                   # Arquivos estáticos
├── .env                      # Variáveis de ambiente (local)
├── vite.config.ts            # Configuração do Vite (com proxy)
├── vercel.json               # Configuração da Vercel
└── package.json              # Dependências
```

---

## Deploy na Vercel

### Variáveis de Ambiente na Vercel
Configure no dashboard da Vercel:
1. `GOOGLE_SCRIPT_URL` → URL do Google Apps Script
2. `API_KEY` → Chave de API para autenticação

### Deploy Automático
Conecte o repositório GitHub à Vercel:
- Push para `main` → Deploy automático
- Pull Requests → Preview deployments

---

## Suporte

Em caso de problemas:
1. Verifique os logs no terminal
2. Abra DevTools → Console para erros no navegador
3. Verifique se o Google Apps Script está respondendo
4. Consulte a documentação do Vite: https://vitejs.dev

---

**Última atualização:** 2025-01-12
