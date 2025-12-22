// api/index.js
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.API_KEY || '';
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';
  
  console.log('[API] =====================================');
  console.log('[API] Método:', req.method);
  console.log('[API] URL:', req.url);
  console.log('[API] Query:', req.query);
  console.log('[API] Body:', typeof req.body === 'object' ? JSON.stringify(req.body).substring(0, 200) : req.body);
  console.log('[API] Content-Type:', req.headers['content-type']);
  console.log('[API] =====================================');

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
    // ⭐⭐ IMPORTANTE: Para GET, o action deve vir do query string
    // Para POST, pode vir do query ou do body
    
    let action;
    
    if (req.method === 'GET') {
      // Para GET, action deve estar na query string
      action = req.query.action;
      
      if (!action) {
        // Se for uma requisição GET sem action, pode ser uma página ou outro endpoint
        console.log('[API] GET sem action - possivelmente página estática ou outro endpoint');
        // Retorna erro apenas se realmente for uma chamada de API
        if (req.url === '/api' || req.url.startsWith('/api?')) {
          return res.status(400).json({
            error: 'Parâmetro "action" obrigatório para GET',
            exemplos: {
              GET: ['getConfig', 'getCategorias', 'getProdutos', 'getBairros', 'getPedidos', 'getParceiros', 'getCupons'],
              POST: ['salvarPedido', 'atualizarStatus', 'saveProduct', 'deleteProduct', 'salvarCategoria', 'deletarCategoria', 'validarCupom', 'salvarCupom', 'registrarUsoCupom']
            }
          });
        }
        // Se não for uma chamada de API, pode ser outra coisa
        return res.status(404).json({ error: 'Endpoint não encontrado' });
      }
    } else if (req.method === 'POST') {
      // Para POST, pode vir do query ou do body
      action = req.query.action || (req.body && req.body.action);
      
      if (!action) {
        return res.status(400).json({
          error: 'Parâmetro "action" obrigatório',
          exemplos: {
            GET: ['getConfig', 'getCategorias', 'getProdutos', 'getBairros', 'getPedidos', 'getParceiros', 'getCupons'],
            POST: ['salvarPedido', 'atualizarStatus', 'saveProduct', 'deleteProduct', 'salvarCategoria', 'deletarCategoria', 'validarCupom', 'salvarCupom', 'registrarUsoCupom']
          }
        });
      }
    }

    console.log('[API] Action:', action, 'Método:', req.method);

    // 🔵 ROTA GET
    if (req.method === 'GET') {
      const allowedGetActions = [
        'getConfig', 'getCategorias', 'getProdutos', 
        'getBairros', 'getPedidos', 'getParceiros',
        'getCupons'
      ];
      
      if (!allowedGetActions.includes(action)) {
        return res.status(400).json({
          error: 'Ação GET não permitida',
          acoes_permitidas: allowedGetActions,
          action_recebida: action
        });
      }

      // ⭐⭐ CRÍTICO: Para GET, precisamos passar o action na query string do Google Script
      const url = `${GOOGLE_SCRIPT_URL}?action=${encodeURIComponent(action)}&key=${API_KEY}`;
      console.log(`[GET ${action}] Fetching: ${url.replace(API_KEY, '***')}`);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 30000 // 30 segundos timeout
        });

        const responseText = await response.text();
        
        console.log(`[GET ${action}] Status: ${response.status}, Length: ${responseText.length} chars`);
        
        if (!response.ok) {
          console.error(`[GET ${action} ERROR] Response:`, responseText.substring(0, 500));
          return res.status(response.status).json({
            error: 'Erro do Google Script',
            message: responseText.substring(0, 200),
            action: action,
            status: response.status
          });
        }

        let data;
        try {
          data = JSON.parse(responseText);
          console.log(`[GET ${action} SUCCESS] Tipo:`, Array.isArray(data) ? 'Array' : 'Object');
          
          // Log específico para produtos
          if (action === 'getProdutos' && Array.isArray(data)) {
            console.log(`[GET Produtos] ${data.length} produtos carregados`);
            if (data.length > 0) {
              console.log(`[GET Produtos] Primeiro produto:`, {
                id: data[0].id,
                nome: data[0].nome,
                categoria_id: data[0].categoria_id,
                preco: data[0].preco
              });
            }
          }
          
          // Log específico para categorias
          if (action === 'getCategorias' && Array.isArray(data)) {
            console.log(`[GET Categorias] ${data.length} categorias carregadas`);
          }
          
        } catch (jsonError) {
          console.error(`[GET ${action} JSON ERROR]:`, jsonError.message);
          console.error(`[GET ${action} RAW RESPONSE (primeiros 500 chars)]:`, responseText.substring(0, 500));
          
          // Retornar dados vazios em caso de erro de parse
          if (action === 'getConfig') {
            data = {
              telefone_whatsapp: '',
              moeda: 'R$',
              nome_loja: 'Loja',
              pedido_minimo_entrega: 0,
              mensagem_retirada: 'Pedido disponível para retirada em 20 minutos'
            };
          } else if (action === 'getCupons') {
            data = { cupons: [] };
          } else {
            data = [];
          }
        }

        // Ajustes de formato
        if (action === 'getPedidos' && data && data.pedidos !== undefined) {
          console.log('[GET Pedidos] Convertendo de {pedidos: []} para []');
          data = data.pedidos;
        }
        
        if (action === 'getCupons' && data && !data.cupons) {
          console.log('[GET Cupons] Padronizando formato para { cupons: [] }');
          data = { cupons: Array.isArray(data) ? data : [] };
        }

        return res.status(200).json(data);

      } catch (fetchError) {
        console.error(`[GET ${action} FETCH ERROR]:`, fetchError.message);
        
        // Retornar resposta de fallback
        const fallbackData = {
          getConfig: {
            telefone_whatsapp: '',
            moeda: 'R$',
            nome_loja: 'Loja',
            pedido_minimo_entrega: 0,
            mensagem_retirada: 'Pedido disponível para retirada em 20 minutos'
          },
          getCategorias: [],
          getProdutos: [],
          getBairros: [],
          getPedidos: [],
          getParceiros: [],
          getCupons: { cupons: [] }
        };
        
        if (fallbackData[action] !== undefined) {
          console.log(`[GET ${action}] Retornando dados de fallback`);
          return res.status(200).json(fallbackData[action]);
        }
        
        return res.status(500).json({
          error: 'Erro ao conectar com Google Script',
          action: action,
          message: fetchError.message
        });
      }
    }

    // 🔴 ROTA POST
    if (req.method === 'POST') {
      console.log(`[POST] Ação: ${action}, Body:`, req.body);

      const allowedPostActions = [
        'salvarPedido', 'atualizarStatus', 'saveProduct',
        'deleteProduct', 'salvarCategoria', 'deletarCategoria',
        'validarCupom', 'salvarCupom', 'registrarUsoCupom'
      ];
      
      if (!allowedPostActions.includes(action)) {
        return res.status(400).json({
          error: 'Ação POST não permitida',
          acoes_permitidas: allowedPostActions,
          action_recebida: action
        });
      }

      // Para POST, o action pode estar na URL ou no body
      const url = `${GOOGLE_SCRIPT_URL}?action=${action}&key=${API_KEY}`;

      console.log(`[POST] Enviando para: ${url}`);

      // Log específico para validação de cupom
      if (action === 'validarCupom') {
        console.log('[CUPOM VALIDAR] Dados:', {
          codigo: req.body.codigo,
          subtotal: req.body.subtotal,
          tipo_entrega: req.body.tipo_entrega
        });
      }

      const bodyString = JSON.stringify(req.body);
      
      console.log(`[POST DEBUG] Body enviado:`, bodyString.substring(0, 300));

      const response = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: bodyString
      });

      const responseText = await response.text();

      console.log(`[POST Response - ${action}] Status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`[POST ERROR - ${action}] Status ${response.status}:`, responseText.substring(0, 500));
        return res.status(response.status).json({
          error: 'Erro do Google Script',
          message: responseText.substring(0, 200),
          action: action
        });
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log(`[POST SUCCESS - ${action}]:`, {
          success: result.success,
          message: result.message,
          error: result.error,
          ...(action === 'validarCupom' && {
            valido: result.valido,
            valor_calculado: result.valor_calculado
          })
        });
      } catch (jsonError) {
        console.error(`[POST JSON Parse Error - ${action}]:`, responseText);
        result = {
          rawResponse: responseText,
          warning: 'Could not parse as JSON',
          length: responseText.length
        };
      }

      return res.status(200).json(result);
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
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}