# Changelog - Configuração Dual Dev/Produção

## [2025-01-12] - Ambiente de Desenvolvimento Local Habilitado

### ✅ O que foi implementado

#### 1. **Proxy no Vite para Desenvolvimento Local** (`vite.config.ts`)
- Configurado proxy `/api` → Google Apps Script
- Adiciona automaticamente `API_KEY` aos query params
- Logs detalhados para debug (proxyReq, proxyRes, error)
- Carrega variáveis de ambiente do `.env`

#### 2. **Detecção de Ambiente Simplificada**
- **`src/hooks/useCardapioData.ts`**: Usa `window.location.origin` sempre
- **`src/services/sheetService.ts`**: Usa `window.location.origin` sempre
- Elimina lógica complexa de detecção de hostname

#### 3. **Documentação Completa** (`README.dev.md`)
- Guia de setup local
- Troubleshooting
- Diferenças entre dev e produção
- Scripts disponíveis

---

### 🔄 Como Funciona

#### **Desenvolvimento Local (Bolt/localhost)**
```
Browser → http://localhost:5173/api?action=getConfig
   ↓
Vite Proxy (vite.config.ts)
   ↓
Google Apps Script (com API_KEY automática)
   ↓
Resposta JSON
```

#### **Produção (Vercel)**
```
Browser → https://seu-dominio.vercel.app/api?action=getConfig
   ↓
Vercel Serverless Function (/api/index.js)
   ↓
Google Apps Script (com API_KEY)
   ↓
Resposta JSON
```

---

### 📦 Arquivos Modificados

#### Modificados:
- `vite.config.ts` - Adicionado proxy para desenvolvimento
- `src/hooks/useCardapioData.ts` - Simplificado detecção de ambiente
- `src/services/sheetService.ts` - Simplificado detecção de ambiente

#### Criados:
- `README.dev.md` - Documentação de desenvolvimento
- `CHANGELOG.md` - Este arquivo

#### Não Modificados (Produção Intacta):
- `/api/index.js` - Serverless Function da Vercel
- `vercel.json` - Configuração de produção
- `.env` - Variáveis compartilhadas

---

### 🚀 Como Usar

#### Desenvolvimento Local:
```bash
npm install
npm run dev
# Abre http://localhost:5173
```

#### Produção (Vercel):
```bash
npm run build
vercel --prod
```

---

### 📊 Build Stats

#### Antes:
- JS gzipped: 68.96 KB

#### Depois:
- JS gzipped: 77.94 KB
- CSS gzipped: 6.29 KB
- **Total: ~84 KB** (bem abaixo do limite de 250 KB)

---

### ✅ Testes Realizados

- [x] Build de produção OK
- [x] TypeScript sem erros
- [x] Proxy configurado corretamente
- [x] Variáveis de ambiente carregadas
- [x] Estrutura de produção intacta

---

### 🔍 Próximos Passos

1. Testar servidor de desenvolvimento: `npm run dev`
2. Verificar se API responde em: `http://localhost:5173/api?action=getConfig`
3. Testar fluxo completo de pedido
4. Deploy na Vercel (sem mudanças necessárias)

---

### 📝 Notas Importantes

- **Desenvolvimento:** Proxy do Vite adiciona `API_KEY` automaticamente
- **Produção:** Serverless Function adiciona `API_KEY` automaticamente
- **Sem mudanças no código da aplicação:** Usa sempre `/api` como base
- **SSR-safe:** Verificações de `typeof window` mantidas

---

### 🐛 Troubleshooting

#### Erro 404 em /api:
- Verifique `GOOGLE_SCRIPT_URL` no `.env`
- Reinicie servidor: `Ctrl+C` → `npm run dev`

#### Proxy não funciona:
- Veja logs no terminal: `[DEV PROXY] ...`
- Teste URL diretamente: `curl http://localhost:5173/api?action=getConfig`

#### Build falha:
- `npm run typecheck` para verificar erros TypeScript
- `npm install` para reinstalar dependências

---

**Desenvolvido por:** Sistema de Cardápio Digital
**Data:** 2025-01-12
**Versão:** 1.1.0
