# Configuração do Cloudinary na Vercel

Este guia explica como configurar o Cloudinary para upload de imagens na Vercel.

## Problema Identificado

O alerta "Cloudinary não configurado" aparece porque as variáveis de ambiente não estão configuradas corretamente na Vercel.

## Solução

### 1. Configurar Variáveis de Ambiente na Vercel

Acesse o painel da Vercel e adicione as seguintes variáveis:

#### Variáveis Necessárias:

```
CLOUDINARY_CLOUD_NAME=dm5scqxho
CLOUDINARY_UPLOAD_PRESET=cardapio_upload
```

**IMPORTANTE:** Use esses nomes exatos, **SEM** o prefixo `VITE_`.

### 2. Passos Detalhados

1. Acesse https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione cada variável:
   - Nome: `CLOUDINARY_CLOUD_NAME`
   - Valor: `dm5scqxho`
   - Ambiente: Production, Preview, Development (marque todos)
   - Clique em **Add**

5. Adicione a segunda variável:
   - Nome: `CLOUDINARY_UPLOAD_PRESET`
   - Valor: `cardapio_upload`
   - Ambiente: Production, Preview, Development (marque todos)
   - Clique em **Add**

### 3. Fazer Redeploy

Após adicionar as variáveis, você **DEVE** fazer um redeploy:

1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**
4. Confirme

### 4. Verificar se Funcionou

Após o redeploy:

1. Acesse o painel administrativo
2. Tente adicionar ou editar um produto
3. O alerta do Cloudinary não deve mais aparecer
4. O botão de upload de imagem deve estar habilitado

## Observações

### Desenvolvimento Local

Para desenvolvimento local (localhost), você precisa adicionar as variáveis no arquivo `.env.local`:

```
VITE_CLOUDINARY_CLOUD_NAME=dm5scqxho
VITE_CLOUDINARY_UPLOAD_PRESET=cardapio_upload
```

Note que no desenvolvimento local usamos o prefixo `VITE_` porque o Vite expõe apenas variáveis com esse prefixo para o código do cliente.

### Produção (Vercel)

Na Vercel, usamos as variáveis **SEM** o prefixo `VITE_` porque a API serverless (em `/api/index.js`) é executada no servidor e tem acesso direto às variáveis de ambiente do Node.js.

## Como Funciona

1. O frontend tenta fazer upload através de `/api?action=uploadImage`
2. A API Vercel verifica se `CLOUDINARY_CLOUD_NAME` e `CLOUDINARY_UPLOAD_PRESET` estão configuradas
3. Se sim, faz o upload para o Cloudinary
4. Retorna a URL da imagem para o frontend
5. O frontend exibe a imagem no formulário

## Troubleshooting

### Ainda vejo o alerta após configurar

- Certifique-se de que fez o **redeploy**
- Verifique se os nomes das variáveis estão corretos (sem prefixo VITE_)
- Limpe o cache do navegador

### Upload falha mesmo com variáveis configuradas

- Verifique se o `Upload Preset` do Cloudinary está configurado como **Unsigned**
- Verifique se o Cloud Name está correto
- Confira os logs da Vercel para ver mensagens de erro detalhadas

### Como ver os logs na Vercel

1. Vá em **Deployments**
2. Clique no último deploy
3. Vá em **Functions**
4. Clique em `/api`
5. Veja os logs em tempo real

## Créditos do Cloudinary

O plano gratuito do Cloudinary oferece:
- 25 GB de armazenamento
- 25 GB de bandwidth/mês
- 25.000 transformações/mês

Isso é mais do que suficiente para um cardápio digital.
