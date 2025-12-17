// hooks/useCardapioData.ts
import { useState, useEffect, useCallback } from 'react';
import { Config, Categoria, Produto, Bairro } from '../types';

// Helper para obter variáveis de ambiente de forma segura
const getEnvVars = () => {
  // Em desenvolvimento (Vite) - usa variáveis com prefixo VITE_
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteMode = import.meta.env.MODE || 'development';
    console.log('🚀 Ambiente Vite detectado, MODE:', viteMode);
    
    return {
      apiKey: import.meta.env.VITE_API_KEY || '',
      googleScriptUrl: import.meta.env.VITE_GOOGLE_SCRIPT_URL || '',
      isVite: true
    };
  }
  
  // Em produção no Vercel - usa variáveis sem prefixo via API própria
  return {
    apiKey: '', // Não usamos mais, a API própria lida com isso
    googleScriptUrl: '', // Usamos a API própria
    isVite: false
  };
};

export const useCardapioData = () => {
  const [config, setConfig] = useState<Partial<Config>>({
    moeda: 'BRL',
    pedido_minimo_entrega: 0
  });
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const env = getEnvVars();
      const isDev = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
      
      console.log('🔗 Ambiente:', isDev ? 'DESENVOLVIMENTO' : 'PRODUÇÃO');
      console.log('🔗 Modo Vite:', env.isVite);
      console.log('🔗 Usando API própria:', !env.isVite);

      // AGORA SEMPRE USAMOS NOSSA PRÓPRIA API EM PRODUÇÃO
      // Em desenvolvimento, podemos usar o Google Script direto ou nossa API local
      
      let baseUrl = '';
      
      if (isDev && env.isVite && env.googleScriptUrl) {
        // Desenvolvimento local com Vite - usa Google Script direto
        console.log('🔧 Modo: Desenvolvimento com Google Script direto');
        const buildUrl = (action: string) => 
          `${env.googleScriptUrl}?action=${action}&key=${env.apiKey}`;
        
        baseUrl = buildUrl;
      } else {
        // Produção ou sem variáveis - usa nossa própria API (/api)
        console.log('🔧 Modo: Usando API própria (/api)');
        const buildUrl = (action: string) => 
          `/api?action=${action}`;
        
        baseUrl = buildUrl;
      }

      console.log('📡 URLs das requisições:');
      console.log('- Config:', baseUrl('getConfig'));
      
      // Fazer todas as requisições em paralelo
      const [configRes, categoriasRes, produtosRes, bairrosRes] = await Promise.all([
        fetch(baseUrl('getConfig')),
        fetch(baseUrl('getCategorias')),
        fetch(baseUrl('getProdutos')),
        fetch(baseUrl('getBairros'))
      ]);

      // Verificar respostas
      const responses = [configRes, categoriasRes, produtosRes, bairrosRes];
      const failedResponse = responses.find(r => !r.ok);
      if (failedResponse) {
        throw new Error(`Erro HTTP ${failedResponse.status} em uma das requisições`);
      }

      const [configData, categoriasData, produtosData, bairrosData] = await Promise.all([
        configRes.json(),
        categoriasRes.json(),
        produtosRes.json(),
        bairrosRes.json()
      ]);

      console.log('✅ Dados recebidos:', {
        config: configData,
        categoriasCount: Array.isArray(categoriasData) ? categoriasData.length : 0,
        produtosCount: Array.isArray(produtosData) ? produtosData.length : 0,
        bairrosCount: Array.isArray(bairrosData) ? bairrosData.length : 0
      });

      let processedConfig: Partial<Config> = {
        moeda: 'BRL',
        pedido_minimo_entrega: 0
      };

      if (Array.isArray(configData)) {
        // Sua planilha retorna um array com um objeto
        if (configData.length > 0) {
          const configObj = configData[0];
          processedConfig = {
            telefone_whatsapp: configObj.telefone_whatsapp || configObj.whatsapp || '',
            moeda: configObj.moeda || 'BRL',
            nome_loja: configObj.nome_loja || configObj.Loja || 'Loja',
            pedido_minimo_entrega: configObj.pedido_minimo_entrega || 0,
            mensagem_retirada: configObj.mensagem_retirada || 'Retire em 20 minutos'
          };
        }
      } else if (typeof configData === 'object' && configData !== null) {
        // Formato objeto direto (menos comum)
        processedConfig = {
          telefone_whatsapp: configData.telefone_whatsapp || configData.whatsapp || '',
          moeda: configData.moeda || 'BRL',
          nome_loja: configData.nome_loja || configData.Loja || 'Loja',
          pedido_minimo_entrega: configData.pedido_minimo_entrega || 0,
          mensagem_retirada: configData.mensagem_retirada || 'Retire em 20 minutos'
        };
      }

      // Processar categorias
      let processedCategorias: Categoria[] = [];
      
      if (Array.isArray(categoriasData)) {
        processedCategorias = categoriasData.map((cat: any) => ({
          categoria_id: cat.id?.toString() || cat.categoria_id?.toString() || '',
          nome: cat.nome?.toString() || '',
          descricao: cat.descricao?.toString() || '',
          posicao: parseInt(cat.posicao) || parseInt(cat.posição) || 1,
          visivel: cat.visivel === true || cat.visivel === 'TRUE' || cat.visivel === '1' || cat.visível === true,
          icone_svg: cat.icone_svg?.toString() || cat.icone?.toString() || 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
        }));
      }
      
      // Ordenar por posição
      processedCategorias.sort((a, b) => a.posicao - b.posicao);
      setCategorias(processedCategorias);

      // Processar produtos
      let processedProdutos: Produto[] = [];
      if (Array.isArray(produtosData)) {
        processedProdutos = produtosData.map((prod: any) => ({
          produto_id: prod.id?.toString() || prod.produto_id?.toString() || '',
          nome: prod.nome?.toString() || '',
          descricao: prod.descricao?.toString() || '',
          preco: typeof prod.preco === 'string' 
            ? parseFloat(prod.preco.replace('R$', '').trim().replace('.', '').replace(',', '.'))
            : parseFloat(prod.preco) || 0,
          imagem_url: prod.imagem_url?.toString() || '',
          categoria_id: prod.categoria_id?.toString() || '',
          disponivel: prod.disponivel === true || prod.disponivel === 'TRUE' || prod.disponivel === '1',
          posicao: parseInt(prod.posicao) || 1,
          opcoes: prod.opcoes || (prod.opcoes_json ? JSON.parse(prod.opcoes_json) : [])
        }));
      }
      processedProdutos.sort((a, b) => a.posicao - b.posicao);
      setProdutos(processedProdutos);

      // Processar bairros
      let processedBairros: Bairro[] = [];
      if (Array.isArray(bairrosData)) {
        processedBairros = bairrosData.map((bairro: any) => ({
          id: bairro.id?.toString() || '',
          nome: bairro.nome?.toString() || '',
          taxa: typeof bairro.taxa === 'string'
            ? parseFloat(bairro.taxa.replace('R$', '').trim().replace('.', '').replace(',', '.'))
            : parseFloat(bairro.taxa) || 0,
          tempo_entrega: bairro.tempo_entrega?.toString() || '',
          ativo: bairro.ativo === true || bairro.ativo === 'TRUE' || bairro.ativo === '1'
        }));
      }
      setBairros(processedBairros);

      console.log('📊 Dados processados:', {
        config: processedConfig,
        categorias: processedCategorias.length,
        produtos: processedProdutos.length,
        bairros: processedBairros.length
      });

      setConfig(processedConfig);

    } catch (err: any) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(err.message || 'Erro ao carregar dados do cardápio');
      
      // Fallback para evitar erros em produção
      setConfig({
        telefone_whatsapp: '5511999999999',
        moeda: 'BRL',
        nome_loja: 'Roast Coffee',
        pedido_minimo_entrega: 0,
        mensagem_retirada: 'Retire em 15 minutos'
      });
      setCategorias([]);
      setProdutos([]);
      setBairros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    config, 
    categorias, 
    produtos, 
    bairros, 
    loading, 
    error,
    refetch: fetchData 
  };
};