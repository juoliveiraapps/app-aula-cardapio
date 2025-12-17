// hooks/useCardapioData.ts
import { useState, useEffect, useCallback } from 'react';
import { Config, Categoria, Produto, Bairro } from '../types';

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

      console.log('🔗 Iniciando busca de dados...');
      
      // FUNÇÃO PARA USAR SUA API PRÓPRIA
      const buildUrl = (action: string) => {
        const baseUrl = '/api';
        return `${baseUrl}?action=${encodeURIComponent(action)}`;
      };

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
        console.error('❌ Erro na resposta:', {
          status: failedResponse.status,
          statusText: failedResponse.statusText,
          text: errorText.substring(0, 200)
        });
        throw new Error(`Erro HTTP ${failedResponse.status}: ${failedResponse.statusText}`);
      }

      const [configData, categoriasData, produtosData, bairrosData] = await Promise.all([
        configRes.json(),
        categoriasRes.json(),
        produtosRes.json(),
        bairrosRes.json()
      ]);

      console.log('✅ Dados recebidos da API:', {
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
        // Formato array
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
        // Formato objeto
        processedConfig = {
          telefone_whatsapp: configData.telefone_whatsapp || configData.whatsapp || '',
          moeda: configData.moeda || 'BRL',
          nome_loja: configData.nome_loja || configData.Loja || 'Loja',
          pedido_minimo_entrega: configData.pedido_minimo_entrega || 0,
          mensagem_retirada: configData.mensagem_retirada || 'Retire em 20 minutos'
        };
      }

      console.log('⚙️ Configuração processada:', processedConfig);
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
      
      // Ordenar por posição
      processedCategorias.sort((a, b) => a.posicao - b.posicao);
      setCategorias(processedCategorias);
      console.log('📁 Categorias carregadas:', processedCategorias.length);

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
      console.log('🍽️ Produtos carregados:', processedProdutos.length);

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
      console.log('📍 Bairros carregados:', processedBairros.length);

    } catch (err: any) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(err.message || 'Erro ao carregar dados do cardápio');
      
      // Fallback para desenvolvimento
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔄 Usando fallback para desenvolvimento...');
        setConfig({
          telefone_whatsapp: '5511999999999',
          moeda: 'BRL',
          nome_loja: 'Roast Coffee',
          pedido_minimo_entrega: 0,
          mensagem_retirada: 'Retire em 15 minutos'
        });
        setCategorias([{
          categoria_id: '1',
          nome: 'Cafés',
          descricao: 'Os melhores cafés',
          posicao: 1,
          visivel: true,
          icone_svg: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
        }]);
        setProdutos([]);
        setBairros([]);
      }
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