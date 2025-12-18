// api/index.js
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔧 VARIÁVEIS DE AMBIENTE DO VERCEL
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

      // 🔧 PROCESSAMENTO ESPECÍFICO PARA CADA AÇÃO
      
      // Configurações da loja
      if (action === 'getConfig') {
        console.log('[CONFIG DEBUG] Dados brutos do Google Script:', {
          type: typeof data,
          isArray: Array.isArray(data),
          keys: data ? Object.keys(data) : 'no data',
          raw: data
        });
        
        // Se for array, pegar o primeiro objeto
        if (Array.isArray(data) && data.length > 0) {
          console.log('[CONFIG] Transformando array para objeto:', data[0]);
          data = data[0];
        }
        
        // CORREÇÃO: Ajustar os nomes das propriedades
        const processedConfig = {
          telefone_whatsapp: data.telefone_whatsapp || data.whatsapp || '',
          moeda: data.moeda || 'BRL',
          nome_loja: data.nome_loja || data.Loja || 'Loja',
          pedido_minimo_entrega: parseFloat(data.pedido_minimo_entrega) || 0,
          mensagem_retirada: data.mensagem_retirada || 'Pedido disponível para retirada em 20 minutos'
        };
        
        console.log('[CONFIG DEBUG] Dados recebidos do Google Script:');
        console.log('- telefone_whatsapp:', data.telefone_whatsapp);
        console.log('- whatsapp:', data.whatsapp);
        console.log('- moeda:', data.moeda);
        console.log('- Loja:', data.Loja);
        console.log('- nome_loja:', data.nome_loja);
        
        console.log('[CONFIG] Configuração processada para frontend:', processedConfig);
        data = processedConfig;
      }

      // Processamento de parceiros
      if (action === 'getParceiros') {
        console.log('[PARCEIROS DEBUG] Dados brutos do Google Script:', {
          type: typeof data,
          isArray: Array.isArray(data),
          keys: data ? Object.keys(data) : 'no data',
          raw: JSON.stringify(data).substring(0, 500)
        });
        
        // Se a API retornar objeto com estrutura { success, total, parceiros }
        if (data && typeof data === 'object' && data.success !== undefined) {
          console.log(`[PARCEIROS] Formato objeto com sucesso: ${data.success}, total: ${data.total}`);
          
          if (data.parceiros && Array.isArray(data.parceiros)) {
            console.log(`[PARCEIROS] ${data.parceiros.length} parceiros encontrados`);
            
            // Padronizar os nomes das propriedades
            const parceirosProcessados = data.parceiros.map(parceiro => ({
              nome: parceiro.nome || '',
              imagem: parceiro.imagem || '',
              descricao: parceiro.descricao || parceiro.descrição || ''
            }));
            
            data = {
              success: true,
              total: parceirosProcessados.length,
              parceiros: parceirosProcessados
            };
          } else {
            console.log('[PARCEIROS] Formato correto mas sem array de parceiros');
            data = {
              success: true,
              total: 0,
              parceiros: []
            };
          }
        } 
        // Se retornar array direto
        else if (Array.isArray(data)) {
          console.log(`[PARCEIROS] Array direto com ${data.length} parceiros`);
          
          const parceirosProcessados = data.map(parceiro => ({
            nome: parceiro.nome || '',
            imagem: parceiro.imagem || '',
            descricao: parceiro.descricao || parceiro.descrição || ''
          }));
          
          data = {
            success: true,
            total: parceirosProcessados.length,
            parceiros: parceirosProcessados
          };
        }
        // Formato inesperado
        else {
          console.log('[PARCEIROS] Formato inesperado, forçando estrutura:', typeof data);
          data = {
            success: true,
            total: 0,
            parceiros: []
          };
        }
        
        console.log('[PARCEIROS] Dados processados para frontend:', {
          success: data.success,
          total: data.total,
          parceirosCount: data.parceiros?.length || 0
        });
      }

      console.log(`[GET SUCCESS] ${action}:`, 
        action === 'getPedidos' 
          ? `${data.pedidos?.length || 0} pedidos` 
          : Array.isArray(data) ? `${data.length} items` : 'object'
      );

      return res.status(200).json(data);
    }

    // 🔴 ROTA POST - CORRIGIDA!
    if (req.method === 'POST') {
      console.log(`[POST] Ação: ${action}, Body:`, req.body);

      // 🖼️ UPLOAD DE IMAGEM PARA CLOUDINARY
      if (action === 'uploadImage') {
        const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
        const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || '';

        console.log('[CLOUDINARY] Verificando configuração:', {
          cloudName: CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
          uploadPreset: CLOUDINARY_UPLOAD_PRESET ? '✅' : '❌'
        });

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
          return res.status(500).json({
            success: false,
            error: 'Cloudinary não configurado',
            message: 'Configure CLOUDINARY_CLOUD_NAME e CLOUDINARY_UPLOAD_PRESET no Vercel',
            details: {
              cloudName: !!CLOUDINARY_CLOUD_NAME,
              uploadPreset: !!CLOUDINARY_UPLOAD_PRESET
            }
          });
        }

        try {
          // Cloudinary aceita FormData diretamente
          const formData = new FormData();

          // Pegar o arquivo do body (Vercel já processa o FormData)
          if (!req.body || !req.body.file) {
            throw new Error('Nenhum arquivo foi enviado');
          }

          formData.append('file', req.body.file);
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
          formData.append('folder', 'cardapio-digital');

          const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

          console.log('[CLOUDINARY] Enviando para:', cloudinaryUrl);

          const uploadResponse = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('[CLOUDINARY ERROR]:', errorText);
            throw new Error(`Cloudinary upload failed: ${uploadResponse.status}`);
          }

          const uploadData = await uploadResponse.json();

          console.log('[CLOUDINARY SUCCESS]:', {
            url: uploadData.secure_url,
            publicId: uploadData.public_id
          });

          return res.status(200).json({
            success: true,
            url: uploadData.secure_url,
            public_id: uploadData.public_id,
            format: uploadData.format,
            width: uploadData.width,
            height: uploadData.height
          });

        } catch (error) {
          console.error('[CLOUDINARY UPLOAD ERROR]:', error);
          return res.status(500).json({
            success: false,
            error: 'Erro no upload',
            message: error.message
          });
        }
      }

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
      console.log(`[POST] Body detalhado:`, JSON.stringify(req.body, null, 2));

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

      if (action === 'deleteProduct') {
        console.log('[PRODUTO DELETE] ID:', req.body.id);
      }

      if (action === 'salvarCategoria') {
        console.log('[CATEGORIA] Operação:', req.body.id ? `UPDATE (id: ${req.body.id})` : 'INSERT');
        console.log('[CATEGORIA] Campos:', {
          id: req.body.id || 'novo',
          nome: req.body.nome,
          posicao: req.body.posicao,
          visivel: req.body.visivel,
          icone_svg: req.body.icone_svg
        });
      }

      if (action === 'deletarCategoria') {
        console.log('[CATEGORIA DELETE] ID:', req.body.id);
      }

      // ⭐⭐⭐ CORREÇÃO CRÍTICA: O Google Apps Script espera que o body seja uma STRING JSON
      // Não um objeto, mas uma string que será parseada pelo script
      const bodyString = JSON.stringify(req.body);
      
      console.log(`[POST DEBUG] Enviando como string JSON:`, {
        length: bodyString.length,
        preview: bodyString.substring(0, 200)
      });

      // DEBUG EXTRA: Log da URL completa
      console.log(`[POST DEBUG] URL completa: ${url}`);
      console.log(`[POST DEBUG] API Key usada: ${API_KEY.substring(0, 10)}...`);

      const response = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: bodyString // ⬅️ Enviar como STRING, não como objeto
      });

      const responseText = await response.text();

      console.log(`[POST Response - ${action}] Status: ${response.status}`);
      console.log(`[POST Response - ${action}] Body (primeiros 1000 chars):`, responseText.substring(0, 1000));
      
      if (!response.ok) {
        console.error(`[POST ERROR - ${action}] Status ${response.status}:`, responseText.substring(0, 500));
        throw new Error(`Google Script returned ${response.status}: ${responseText.substring(0, 200)}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(`[POST JSON Parse Error - ${action}]:`, responseText);
        // Se não conseguir parsear, retornar o texto cru para debug
        return res.status(200).json({
          rawResponse: responseText,
          warning: 'Could not parse as JSON',
          length: responseText.length
        });
      }

      console.log(`[POST SUCCESS - ${action}]:`, {
        success: result.success,
        message: result.message,
        error: result.error
      });

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