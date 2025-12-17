# Correções no CRUD de Produtos e Categorias

Este documento explica as correções implementadas para resolver os problemas de atualização e exclusão de produtos e categorias.

## Problemas Identificados

### 1. Produtos duplicando em vez de atualizar
- **Causa:** O formulário estava enviando o campo `id`, mas o Google Apps Script pode não estar reconhecendo-o para fazer UPDATE
- **Sintoma:** Ao editar um produto, um novo produto era criado em vez de atualizar o existente

### 2. Erro ao deletar produtos
- **Causa:** O ID do produto pode não estar sendo enviado corretamente
- **Sintoma:** Falha ao tentar deletar produtos

### 3. Categorias não executam CRUD corretamente
- **Causa:** O formulário não estava enviando o campo `id` ao editar
- **Sintoma:** Categorias criavam duplicatas ou não atualizavam

## Correções Implementadas

### 1. CategoryForm - Enviar ID ao Editar

**Arquivo:** `src/components/admin/CategoryForm.tsx`

**O que foi feito:**
```typescript
// ANTES (linha 95)
const success = await onSubmit(formData);

// DEPOIS
const dataToSubmit = {
  ...formData,
  ...(initialData?.id && { id: initialData.id })
};

console.log('[CategoryForm] Enviando dados:', dataToSubmit);
console.log('[CategoryForm] Modo:', initialData?.id ? 'UPDATE' : 'INSERT');

const success = await onSubmit(dataToSubmit);
```

**Impacto:** Agora quando você edita uma categoria, o campo `id` é enviado junto com os dados do formulário.

### 2. AdminCategorias - Corrigir Mapeamento de ID

**Arquivo:** `src/pages/AdminCategorias.tsx`

**O que foi feito:**
```typescript
// ANTES (linha 18)
id: cat.id || '',

// DEPOIS
id: cat.categoria_id || '', // Usar categoria_id do hook
```

**Impacto:** O hook `useCardapioData` retorna `categoria_id`, não `id`. Agora o mapeamento está correto.

### 3. Types - Suportar Ambos os Campos

**Arquivo:** `src/types/index.ts`

**O que foi feito:**
```typescript
// ANTES
export interface Categoria {
  id: string;
  nome: string;
  ...
}

// DEPOIS
export interface Categoria {
  id?: string; // Usado no admin
  categoria_id?: string; // Retornado pela API
  nome: string;
  ...
}
```

**Impacto:** Agora a interface aceita ambos os campos, permitindo compatibilidade entre o admin e o cardápio público.

### 4. API - Logs Detalhados para Debug

**Arquivo:** `api/index.js`

**O que foi adicionado:**
```javascript
// Validações específicas por ação
if (action === 'saveProduct') {
  console.log('[PRODUTO] Operação:', req.body.id ? `UPDATE (id: ${req.body.id})` : 'INSERT');
  console.log('[PRODUTO] Campos:', {
    id: req.body.id || 'novo',
    nome: req.body.nome,
    categoria_id: req.body.categoria_id,
    preco: req.body.preco,
    disponivel: req.body.disponivel
  });
}

if (action === 'salvarCategoria') {
  console.log('[CATEGORIA] Operação:', req.body.id ? `UPDATE (id: ${req.body.id})` : 'INSERT');
  console.log('[CATEGORIA] Campos:', {
    id: req.body.id || 'novo',
    nome: req.body.nome,
    posicao: req.body.posicao
  });
}
```

**Impacto:** Agora você pode ver nos logs da Vercel exatamente quais dados estão sendo enviados para o Google Apps Script.

### 5. API - Upload de Imagens Cloudinary

**Arquivo:** `api/index.js`

**O que foi adicionado:**
- Rota `/api?action=uploadImage` para fazer upload de imagens para o Cloudinary
- Validação se o Cloudinary está configurado
- Mensagens de erro detalhadas

## Como Verificar se Funcionou

### Para Produtos:

1. **Criar Produto:**
   - Vá em Admin → Produtos
   - Clique em "Novo Produto"
   - Preencha os dados
   - Salve
   - ✅ Deve criar um novo produto

2. **Editar Produto:**
   - Clique no ícone de editar de um produto
   - Altere algum campo (ex: nome)
   - Salve
   - ✅ Deve ATUALIZAR o produto existente, NÃO criar um novo

3. **Deletar Produto:**
   - Clique no ícone de lixeira
   - Confirme
   - ✅ Deve remover o produto da lista

### Para Categorias:

1. **Criar Categoria:**
   - Vá em Admin → Categorias
   - Clique em "Nova Categoria"
   - Preencha os dados
   - Salve
   - ✅ Deve criar uma nova categoria

2. **Editar Categoria:**
   - Clique no ícone de editar
   - Altere o nome
   - Salve
   - ✅ Deve ATUALIZAR a categoria existente, NÃO criar uma nova

3. **Deletar Categoria:**
   - Clique no ícone de lixeira
   - Confirme
   - ✅ Deve remover a categoria

## O Que o Google Apps Script Precisa Fazer

Para que essas correções funcionem completamente, o Google Apps Script precisa:

### Para `saveProduct`:

```javascript
function saveProduct(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Produtos');

  if (data.id && data.id !== '') {
    // UPDATE: Buscar linha com este ID e atualizar
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) { // Assumindo que ID está na coluna A
        // Atualizar linha i+1
        sheet.getRange(i + 1, 1, 1, numColunas).setValues([[/* valores atualizados */]]);
        return { success: true, message: 'Produto atualizado' };
      }
    }

    return { success: false, message: 'Produto não encontrado' };
  } else {
    // INSERT: Criar novo ID e adicionar linha
    const newId = Utilities.getUuid();
    sheet.appendRow([newId, data.nome, data.descricao, /* ... */]);
    return { success: true, message: 'Produto criado' };
  }
}
```

### Para `deleteProduct`:

```javascript
function deleteProduct(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Produtos');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) { // ID na coluna A
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Produto deletado' };
    }
  }

  return { success: false, message: 'Produto não encontrado' };
}
```

### Para `salvarCategoria`:

```javascript
function salvarCategoria(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categorias');

  if (data.id && data.id !== '') {
    // UPDATE
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        sheet.getRange(i + 1, 1, 1, numColunas).setValues([[/* valores */]]);
        return { success: true, message: 'Categoria atualizada' };
      }
    }

    return { success: false, message: 'Categoria não encontrada' };
  } else {
    // INSERT
    const newId = Utilities.getUuid();
    sheet.appendRow([newId, data.nome, data.descricao, /* ... */]);
    return { success: true, message: 'Categoria criada' };
  }
}
```

## Como Ver os Logs

### Na Vercel:

1. Acesse https://vercel.com
2. Vá no seu projeto
3. Clique em **Deployments**
4. Clique no último deployment
5. Vá em **Functions**
6. Clique em `/api`
7. Veja os logs em tempo real

Você verá logs como:
```
[POST] Body detalhado: { "id": "abc123", "nome": "Pizza", ... }
[PRODUTO] Operação: UPDATE (id: abc123)
[PRODUTO] Campos: { id: "abc123", nome: "Pizza", ... }
```

### No Console do Navegador:

Abra o DevTools (F12) e vá na aba Console. Você verá:
```
📤 Enviando produto para API: { id: "abc123", ... }
✅ Resposta da API: { success: true, message: "..." }
```

## Troubleshooting

### Produtos ainda duplicando

1. Verifique se o Google Apps Script está verificando o campo `id`
2. Confira os logs da Vercel para ver se o `id` está sendo enviado
3. Verifique se o `id` na planilha corresponde ao `id` enviado

### Categorias não atualizam

1. Verifique se o campo `id` está sendo enviado (veja os logs)
2. Confirme que o Google Apps Script está fazendo UPDATE quando `id` existe
3. Verifique se a coluna de ID na planilha está correta

### Deleção não funciona

1. Verifique se o `id` está sendo enviado no body da requisição
2. Confirme que o Google Apps Script está encontrando a linha correta
3. Verifique se não há proteção na planilha que impeça deleção
