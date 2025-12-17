// hooks/useCardapioData.ts
import { useState, useEffect, useCallback } from 'react';
import { Config, Categoria, Produto, Bairro } from '../types';

// Helper para detectar ambiente
const getEnvironment = () => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('webcontainer-api.io')) {
    return 'stackblitz';
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else {
    return 'production';
  }
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

      const environment = getEnvironment();
      console.log('🔗 Ambiente detectado:', environment);
      
      // CONFIGURAÇÃO POR AMBIENTE
      let buildUrl: (action: string) => string;
      let useMockData = false;
      
      if (environment === 'stackblitz') {
        console.log('🚀 StackBlitz detectado - usando Google Script direto');
        // No StackBlitz, use o Google Script diretamente
        const API_KEY = 'sua_chave_google_script'; // Coloque sua chave aqui
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/SEU_ID/exec'; // Coloque sua URL aqui
        
        buildUrl = (action: string) => 
          `${GOOGLE_SCRIPT_URL}?action=${action}&key=${API_KEY}`;
        
      } else if (environment === 'development') {
        console.log('💻 Desenvolvimento local - usando API local ou Google Script');
        // Desenvolvimento local
        const API_KEY = import.meta.env.VITE_API_KEY || '';
        const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
        
        if (API_KEY && GOOGLE_SCRIPT_URL) {
          buildUrl = (action: string) => 
            `${GOOGLE_SCRIPT_URL}?action=${action}&key=${API_KEY}`;
        } else {
          console.warn('⚠️ Variáveis de ambiente não configuradas. Usando mock data.');
          useMockData = true;
        }
        
      } else {
        console.log('🌐 Produção - usando API própria');
        // Produção na Vercel
        buildUrl = (action: string) => `/api?action=${encodeURIComponent(action)}`;
      }

      console.log('📡 Modo de operação:', useMockData ? 'Mock Data' : 'API Real');

      // SE PRECISAR USAR DADOS MOCK (para desenvolvimento sem API)
      if (useMockData) {
        console.log('🔄 Carregando dados mock...');
        
        // Configuração mock
        setConfig({
          telefone_whatsapp: '5511999999999',
          moeda: 'BRL',
          nome_loja: 'Roast Coffee',
          pedido_minimo_entrega: 25,
          mensagem_retirada: 'Retire em 20 minutos'
        });

        // Categorias mock
        const mockCategorias: Categoria[] = [
          {
            categoria_id: '1',
            nome: 'Cafés',
            descricao: 'Os melhores cafés da casa',
            posicao: 1,
            visivel: true,
            icone_svg: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
          },
          {
            categoria_id: '2',
            nome: 'Bolos',
            descricao: 'Deliciosos bolos caseiros',
            posicao: 2,
            visivel: true,
            icone_svg: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
          }
        ];
        setCategorias(mockCategorias);

        // Produtos mock
        const mockProdutos: Produto[] = [
          {
            produto_id: '1',
            nome: 'Café Expresso',
            descricao: 'Café forte e encorpado',
            preco: 5.90,
            imagem_url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&h=300&fit=crop',
            categoria_id: '1',
            disponivel: true,
            posicao: 1,
            opcoes: []
          },
          {
            produto_id: '2',
            nome: 'Cappuccino',
            descricao: 'Café com leite vaporizado',
            preco: 8.90,
            imagem_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w-400&h=300&fit=crop',
            categoria_id: '1',
            disponivel: true,
            posicao: 2,
            opcoes: []
          }
        ];
        setProdutos(mockProdutos);

        // Bairros mock
        setBairros([
          {
            id: '1',
            nome: 'Centro',
            taxa: 5.00,
            tempo_entrega: '30-40 min',
            ativo: true
          }
        ]);

        setLoading(false);
        return;
      }

      // SE USANDO API REAL
      console.log('📡 URLs das requisições:');
      console.log('- Config:', buildUrl('getConfig'));
      console.log('- Categorias:', buildUrl('getCategorias'));
      console.log('- Produtos:', buildUrl('getProdutos'));
      console.log('- Bairros:', buildUrl('getBairros'));
      
      // Fazer todas as requisições em paralelo
      const [configRes, categoriasRes, produtosRes, bairrosRes] = await Promise.all([
        fetch(buildUrl('getConfig')),
        fetch(buildUrl('getCategorias')),
        fetch(buildUrl('getProdutos')),
        fetch(buildUrl('getBairros'))
      ]);

      // Verificar respostas
      const responses = [configRes, categoriasRes, produtosRes, bairrosRes];
      
      // DEBUG: Verificar cada resposta
      responses.forEach((res, index) => {
        const actions = ['getConfig', 'getCategorias', 'getProdutos', 'getBairros'];
        console.log(`🔍 Response ${actions[index]}:`, {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          url: res.url
        });
      });

      const failedResponse = responses.find(r => !r.ok);
      if (failedResponse) {
        const errorText = await failedResponse.text();
        console.error('❌ Erro na resposta:', errorText.substring(0, 200));
        throw new Error(`Erro HTTP ${failedResponse.status}`);
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

      // Processar configuração
      let processedConfig: Partial<Config> = {
        moeda: 'BRL',
        pedido_minimo_entrega: 0
      };

      if (Array.isArray(configData)) {
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
        processedConfig = {
          telefone_whatsapp: configData.telefone_whatsapp || configData.whatsapp || '',
          moeda: configData.moeda || 'BRL',
          nome_loja: configData.nome_loja || configData.Loja || 'Loja',
          pedido_minimo_entrega: configData.pedido_minimo_entrega || 0,
          mensagem_retirada: configData.mensagem_retirada || 'Retire em 20 minutos'
        };
      }

      console.log('⚙️ Configuração:', processedConfig);
      setConfig(processedConfig);

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
      
      processedCategorias.sort((a, b) => a.posicao - b.posicao);
      setCategorias(processedCategorias);
      console.log('📁 Categorias:', processedCategorias.length);

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
      console.log('🍽️ Produtos:', processedProdutos.length);

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
      console.log('📍 Bairros:', processedBairros.length);

    } catch (err: any) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(err.message || 'Erro ao carregar dados do cardápio');
      
      // Fallback de emergência
      setConfig({
        telefone_whatsapp: '5511999999999',
        moeda: 'BRL',
        nome_loja: 'Roast Coffee',
        pedido_minimo_entrega: 0,
        mensagem_retirada: 'Retire em 15 minutos'
      });
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