export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  const API_KEY = process.env.API_KEY;

  // 🔍 LOGS DE DEBUG DAS VARIÁVEIS
  console.log('[ENV DEBUG] =====================================');
  console.log('[ENV DEBUG] GOOGLE_SCRIPT_URL:', GOOGLE_SCRIPT_URL ? '✅ Configurada' : '❌ NÃO CONFIGURADA');
  console.log('[ENV DEBUG] API_KEY:', API_KEY ? `✅ Configurada (${API_KEY.substring(0, 10)}...)` : '❌ NÃO CONFIGURADA');
  console.log('[ENV DEBUG] NODE_ENV:', process.env.NODE_ENV);
  console.log('[ENV DEBUG] =====================================');

  // 🔒 VALIDAÇÃO CRÍTICA
  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    console.error('[ENV CRITICAL ERROR] Variáveis de ambiente faltando!');
    console.error('- GOOGLE_SCRIPT_URL:', GOOGLE_SCRIPT_URL || 'UNDEFINED');
    console.error('- API_KEY:', API_KEY ? 'DEFINED' : 'UNDEFINED');
    console.error('- Todas env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('API')));
    
    return res.status(500).json({
      error: 'Erro de configuração do servidor',
      message: 'Variáveis de ambiente não configuradas',
      details: {
        GOOGLE_SCRIPT_URL: !!GOOGLE_SCRIPT_URL,
        API_KEY: !!API_KEY,
        NODE_ENV: process.env.NODE_ENV
      },
      solution: 'Verifique as variáveis de ambiente no .env ou Vercel',
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
            pedidos: '/api?action=getPedidos'
          }
        });
      }

      // URL do Google Script COM redirecionamento
      const url = `${GOOGLE_SCRIPT_URL}?action=${encodeURIComponent(action)}&key=${API_KEY}`;
      console.log(`[GET] Fetching: ${url.substring(0, 100)}...`);

      // ⚠️ IMPORTANTE: Google Scripts fazem redirecionamento
      // Precisamos seguir o redirecionamento
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow', // Seguir redirecionamentos
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0' // Alguns scripts exigem user-agent
        }
      });

      // Verificar se a resposta é JSON
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
        
        // Se não for JSON válido, pode ser HTML de erro
        if (responseText.includes('<!doctype') || responseText.includes('<html')) {
          // Extrair erro do HTML se possível
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
            atualizarStatus: '/api?action=atualizarStatus'
          }
        });
      }

      console.log(`[POST] Ação: ${action}, Body:`, req.body);

      // ✅ ROTA: salvarPedido
      if (action === 'salvarPedido') {
        const pedido = req.body;

        if (!pedido || !pedido.cliente) {
          return res.status(400).json({
            error: 'Dados do pedido incompletos',
            required: ['cliente', 'telefone', 'tipo', 'itens', 'total']
          });
        }

        console.log('[POST] Salvando pedido:', {
          cliente: pedido.cliente,
          tipo: pedido.tipo,
          itens: pedido.itens?.length || 0,
          total: pedido.total
        });

        const url = `${GOOGLE_SCRIPT_URL}?action=salvarPedido&key=${API_KEY}`;

        const response = await fetch(url, {
          method: 'POST',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          body: JSON.stringify(pedido)
        });

        const responseText = await response.text();
        
        if (!response.ok) {
          console.error(`[POST ERROR] Status ${response.status}:`, responseText.substring(0, 200));
          throw new Error(`Google Script returned ${response.status}`);
        }

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('[POST JSON Parse Error]:', responseText.substring(0, 500));
          throw new Error('Invalid JSON response from Google Script');
        }

        console.log('[POST SUCCESS - salvarPedido]:', result);

        return res.status(200).json(result);
      }

      // ✅ ROTA: atualizarStatus (NOVA!)
      else if (action === 'atualizarStatus') {
        const { pedidoId, novoStatus } = req.body;

        if (!pedidoId || !novoStatus) {
          return res.status(400).json({
            error: 'Dados para atualizar status incompletos',
            required: ['pedidoId', 'novoStatus'],
            recebido: req.body
          });
        }

        console.log('[POST] Atualizando status:', {
          pedidoId,
          novoStatus
        });

        const url = `${GOOGLE_SCRIPT_URL}?action=atualizarStatus&key=${API_KEY}`;

        const response = await fetch(url, {
          method: 'POST',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          body: JSON.stringify({ pedidoId, novoStatus })
        });

        const responseText = await response.text();
        
        console.log(`[POST Response - atualizarStatus] Status: ${response.status}, Text:`, responseText.substring(0, 300));
        
        if (!response.ok) {
          console.error(`[POST ERROR] Status ${response.status}:`, responseText.substring(0, 200));
          throw new Error(`Google Script returned ${response.status}`);
        }

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('[POST JSON Parse Error - atualizarStatus]:', responseText.substring(0, 500));
          throw new Error('Invalid JSON response from Google Script');
        }

        console.log('[POST SUCCESS - atualizarStatus]:', result);

        return res.status(200).json(result);
      }

      // ❌ Ação desconhecida
      else {
        return res.status(400).json({
          error: 'Ação POST desconhecida',
          acoes_suportadas: ['salvarPedido', 'atualizarStatus']
        });
      }
    }

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
      timestamp: new Date().toISOString()
    });
  }
}