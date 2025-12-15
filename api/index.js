export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔧 VARIÁVEIS DE AMBIENTE (agora com prefixo VITE_)
  const GOOGLE_SCRIPT_URL = process.env.VITE_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;
  const API_KEY = process.env.VITE_API_KEY || process.env.API_KEY;

  // 🔍 LOGS DE DEBUG DAS VARIÁVEIS
  console.log('[ENV DEBUG] =====================================');
  console.log('[ENV DEBUG] GOOGLE_SCRIPT_URL:', GOOGLE_SCRIPT_URL ? '✅ Configurada' : '❌ NÃO CONFIGURADA');
  console.log('[ENV DEBUG] API_KEY:', API_KEY ? `✅ Configurada (${API_KEY.substring(0, 10)}...)` : '❌ NÃO CONFIGURADA');
  console.log('[ENV DEBUG] NODE_ENV:', process.env.NODE_ENV);
  console.log('[ENV DEBUG] AMBIENTE:', process.env.VERCEL_ENV || 'local');
  console.log('[ENV DEBUG] =====================================');

  // 🔒 VALIDAÇÃO CRÍTICA
  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    console.error('[ENV CRITICAL ERROR] Variáveis de ambiente faltando!');
    console.error('- GOOGLE_SCRIPT_URL:', GOOGLE_SCRIPT_URL || 'UNDEFINED');
    console.error('- API_KEY:', API_KEY ? 'DEFINED' : 'UNDEFINED');
    
    // Log de todas env vars disponíveis (para debugging)
    const envVars = Object.keys(process.env).filter(k => 
      k.includes('GOOGLE') || 
      k.includes('API') || 
      k.includes('VITE') ||
      k.includes('VERCEL')
    );
    console.error('- Env vars disponíveis:', envVars.join(', '));
    
    return res.status(500).json({
      error: 'Erro de configuração do servidor',
      message: 'Variáveis de ambiente não configuradas',
      details: {
        GOOGLE_SCRIPT_URL: !!GOOGLE_SCRIPT_URL,
        API_KEY: !!API_KEY,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV
      },
      solution: 'Configure VITE_GOOGLE_SCRIPT_URL e VITE_API_KEY no Vercel Environment Variables',
      timestamp: new Date().toISOString()
    });
  }

  try {
    console.log(`[API] ${req.method} ${req.url} - Query:`, req.query);
    console.log(`[API] URL Base: ${GOOGLE_SCRIPT_URL.substring(0, 50)}...`);

    // 🔵 ROTA GET
    if (req.method === 'GET') {
      const { action } = req.query;

      if (!action) {
        return res.status(400).json({
          error: 'Parâmetro "action" obrigatório',
          exemplos: {
            config: '/api?action=getConfig',
            categorias: '/api?action=getCategorias',
            produtos: '/api?action=getProdutos',
            bairros: '/api?action=getBairros',
            pedidos: '/api?action=getPedidos',
            parceiros: '/api?action=getParceiros'
          }
        });
      }

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
      console.log(`[GET] Fetching: ${url.substring(0, 100)}...`);

      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      console.log(`[GET Response] Status: ${response.status}, Content-Type: ${contentType}, Length: ${responseText.length} chars`);
      
      if (!response.ok) {
        console.error(`[GET ERROR] Status ${response.status}:`, responseText.substring(0, 500));
        throw new Error(`Google Script returned ${response.status}: ${responseText.substring(0, 100)}`);
      }

      // Tentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('[JSON Parse Error] Response (first 500 chars):', responseText.substring(0, 500));
        
        if (responseText.includes('<!doctype') || responseText.includes('<html')) {
          const errorMatch = responseText.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
          const errorText = errorMatch ? errorMatch[1] : 'HTML response from Google Script';
          throw new Error(`Google Script returned HTML: ${errorText.substring(0, 200)}`);
        }
        
        throw new Error(`Invalid JSON response from Google Script. First chars: ${responseText.substring(0, 100)}`);
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
      const { action } = req.query;
      
      if (!action) {
        return res.status(400).json({
          error: 'Parâmetro "action" obrigatório em POST',
          exemplos: {
            salvarPedido: '/api?action=salvarPedido',
            atualizarStatus: '/api?action=atualizarStatus',
            saveProduct: '/api?action=saveProduct',
            deleteProduct: '/api?action=deleteProduct',
            salvarCategoria: '/api?action=salvarCategoria',
            deletarCategoria: '/api?action=deletarCategoria'
          }
        });
      }

      console.log(`[POST] Ação: ${action}, Body:`, 
        action === 'salvarPedido' ? '[pedido data]' : 
        action === 'saveProduct' ? '[product data]' : req.body
      );

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
      
      console.log(`[POST] Enviando para: ${url.substring(0, 100)}...`);

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
      
      console.log(`[POST Response - ${action}] Status: ${response.status}, Text:`, responseText.substring(0, 300));
      
      if (!response.ok) {
        console.error(`[POST ERROR - ${action}] Status ${response.status}:`, responseText.substring(0, 200));
        throw new Error(`Google Script returned ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(`[POST JSON Parse Error - ${action}]:`, responseText.substring(0, 500));
        throw new Error('Invalid JSON response from Google Script');
      }

      console.log(`[POST SUCCESS - ${action}]:`, 
        action === 'salvarPedido' ? `Pedido ID: ${result.pedido_id}` :
        action === 'saveProduct' ? `Product ID: ${result.product_id}` :
        action === 'salvarCategoria' ? `Category ID: ${result.category_id}` :
        'Success'
      );

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