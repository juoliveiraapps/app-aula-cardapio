// api/index.js
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔧 VARIÁVEIS DE AMBIENTE DO VERCEL (SEM prefixo VITE_)
  // ⚠️ ATENÇÃO: Use letras minúsculas ou maiúsculas consistentemente!
  const API_KEY = process.env.API_KEY || '';
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';
  
  // 🔍 LOGS DE DEBUG DAS VARIÁVEIS
  console.log('[API] =====================================');
  console.log('[API] Método:', req.method);
  console.log('[API] URL:', req.url);
  console.log('[API] API_KEY disponível:', API_KEY ? `✅ (${API_KEY.substring(0, 10)}...)` : '❌ NÃO');
  console.log('[API] GOOGLE_SCRIPT_URL:', GOOGLE_SCRIPT_URL ? '✅ Disponível' : '❌ NÃO');
  console.log('[API] =====================================');

  // 🔒 VALIDAÇÃO CRÍTICA DAS VARIÁVEIS
  if (!API_KEY || !GOOGLE_SCRIPT_URL) {
    console.error('[API ERROR] Variáveis de ambiente faltando!');
    return res.status(500).json({
      error: 'Configuração do servidor incompleta',
      details: {
        API_KEY: !!API_KEY,
        GOOGLE_SCRIPT_URL: !!GOOGLE_SCRIPT_URL
      },
      message: 'Configure API_KEY e GOOGLE_SCRIPT_URL no painel do Vercel',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { action } = req.query;

    if (!action) {
      return res.status(400).json({
        error: 'Parâmetro "action" obrigatório',
        exemplos: {
          GET: ['getConfig', 'getCategorias', 'getProdutos', 'getBairros', 'getPedidos', 'getParceiros'],
          POST: ['salvarPedido', 'atualizarStatus', 'saveProduct', 'deleteProduct', 'salvarCategoria', 'deletarCategoria']
        }
      });
    }

    // 🔵 ROTA GET
    if (req.method === 'GET') {
      // AÇÕES PERMITIDAS GET
      const allowedGetActions = [
        'getConfig', 'getCategorias', 'getProdutos', 
        'getBairros', 'getPedidos', 'getParceiros'
      ];
      
      if (!allowedGetActions.includes(action)) {
        return res.status(400).json({
          error: 'Ação GET não permitida',
          acoes_permitidas: allowedGetActions
        });
      }

      // URL do Google Script
      const url = `${GOOGLE_SCRIPT_URL}?action=${encodeURIComponent(action)}&key=${API_KEY}`;
      console.log(`[GET] Fetching: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const responseText = await response.text();
      
      console.log(`[GET Response] Status: ${response.status}, Length: ${responseText.length} chars`);
      
      if (!response.ok) {
        console.error(`[GET ERROR] Status ${response.status}:`, responseText.substring(0, 500));
        throw new Error(`Google Script returned ${response.status}`);
      }

      // Tentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('[JSON Parse Error] Response:', responseText.substring(0, 500));
        throw new Error(`Invalid JSON response from Google Script`);
      }

      console.log(`[GET SUCCESS] ${action}:`, 
        action === 'getPedidos' 
          ? `${data.pedidos?.length || 0} pedidos` 
          : Array.isArray(data) ? `${data.length} items` : 'object'
      );

      return res.status(200).json(data);
    }

    // 🔴 ROTA POST
    if (req.method === 'POST') {
      console.log(`[POST] Ação: ${action}, Body:`, req.body);

      // AÇÕES PERMITIDAS POST
      const allowedPostActions = [
        'salvarPedido', 'atualizarStatus', 'saveProduct', 
        'deleteProduct', 'salvarCategoria', 'deletarCategoria'
      ];
      
      if (!allowedPostActions.includes(action)) {
        return res.status(400).json({
          error: 'Ação POST não permitida',
          acoes_permitidas: allowedPostActions
        });
      }

      // URL do Google Script
      const url = `${GOOGLE_SCRIPT_URL}?action=${action}&key=${API_KEY}`;
      
      console.log(`[POST] Enviando para: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify(req.body)
      });

      const responseText = await response.text();
      
      console.log(`[POST Response - ${action}] Status: ${response.status}, Text:`, responseText);
      
      if (!response.ok) {
        console.error(`[POST ERROR - ${action}] Status ${response.status}:`, responseText.substring(0, 200));
        throw new Error(`Google Script returned ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(`[POST JSON Parse Error - ${action}]:`, responseText);
        throw new Error('Invalid JSON response from Google Script');
      }

      console.log(`[POST SUCCESS - ${action}]:`, result);

      return res.status(200).json(result);
    }

    // Método não permitido
    return res.status(405).json({
      error: 'Método não permitido',
      allowed: ['GET', 'POST', 'OPTIONS']
    });

  } catch (error) {
    console.error('[API FATAL ERROR]:', error.message);
    console.error('[API Stack Trace]:', error.stack);

    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      action: req.query.action || 'unknown',
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}