// hooks/useCardapioData.ts
import { useState, useEffect } from 'react';
import { Config, Categoria, Produto, Bairro } from '../types';

// Helper para pegar variáveis de ambiente de forma segura
const getEnvVars = () => {
  if (typeof window === 'undefined') {
    return { apiKey: '', googleScriptUrl: '' }; // SSR - retorna vazio
  }

  // Em desenvolvimento: VITE_ variáveis
  // Em produção: variáveis injetadas pelo build
  let apiKey = '';
  let googleScriptUrl = '';

  // Tentar obter do import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    apiKey = import.meta.env.VITE_API_KEY || '';
    googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
  }

  // Se não encontrou, tentar buscar de variáveis globais (injetadas em produção)
  if (!apiKey || !googleScriptUrl) {
    // @ts-ignore - window.ENV pode ser injetado pelo build
    const globalEnv = (window as any).ENV || {};
    apiKey = apiKey || globalEnv.API_KEY || '';
    googleScriptUrl = googleScriptUrl || globalEnv.GOOGLE_SCRIPT_URL || '';
  }

  return { apiKey, googleScriptUrl };
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obter variáveis de ambiente
        const { apiKey, googleScriptUrl } = getEnvVars();
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

        console.log('🔗 Ambiente:', isDev ? 'DEV' : 'PROD');
        console.log('🔗 Variáveis:', { 
          hasApiKey: !!apiKey, 
          hasUrl: !!googleScriptUrl,
          hostname: window.location.hostname 
        });

        // Se estamos em desenvolvimento, usa proxy local
        if (isDev) {
          console.log('🔄 Usando proxy local (desenvolvimento)');
          
          const [configRes, categoriasRes, produtosRes, bairrosRes] = await Promise.all([
            fetch('/api?action=getConfig'),
            fetch('/api?action=getCategorias'),
            fetch('/api?action=getProdutos'),
            fetch('/api?action=getBairros')
          ]);

          // Verificar respostas
          const responses = [configRes, categoriasRes, produtosRes, bairrosRes];
          const failedResponse = responses.find(r => !r.ok);
          if (failedResponse) {
            throw new Error(`Erro HTTP ${failedResponse.status}`);
          }

          const [configData, categoriasData, produtosData, bairrosData] = await Promise.all([
            configRes.json(),
            categoriasRes.json(),
            produtosRes.json(),
            bairrosRes.json()
          ]);

          // Processar configurações
          setConfig({
            telefone_whatsapp: configData.telefone_whatsapp || configData.whatsapp || '',
            moeda: configData.moeda || 'BRL',
            nome_loja: configData.nome_loja || configData.Loja || 'Loja',
            pedido_minimo_entrega: configData.pedido_minimo_entrega || 0,
            mensagem_retirada: configData.mensagem_retirada || 'Retire em 20 minutos'
          });

          // Processar categorias
          let processedCategorias: Categoria[] = [];
          
          if (Array.isArray(categoriasData)) {
            processedCategorias = categoriasData.map((cat: any) => ({
              id: cat.id?.toString() || '',
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
              id: prod.id?.toString() || prod.produto_id?.toString() || '',
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

        } else {
          // Em produção: usa URL direta do Google Apps Script
          console.log('🚀 Usando URL direta (produção)');
          
          if (!apiKey || !googleScriptUrl) {
            throw new Error('Variáveis de ambiente não configuradas para produção');
          }

          // Construir URLs
          const buildUrl = (action: string) => 
            `${googleScriptUrl}?action=${action}&key=${apiKey}`;

          const [configRes, categoriasRes, produtosRes, bairrosRes] = await Promise.all([
            fetch(buildUrl('getConfig')),
            fetch(buildUrl('getCategorias')),
            fetch(buildUrl('getProdutos')),
            fetch(buildUrl('getBairros'))
          ]);

          // Verificar respostas
          const responses = [configRes, categoriasRes, produtosRes, bairrosRes];
          const failedResponse = responses.find(r => !r.ok);
          if (failedResponse) {
            throw new Error(`Erro HTTP ${failedResponse.status}`);
          }

          const [configData, categoriasData, produtosData, bairrosData] = await Promise.all([
            configRes.json(),
            categoriasRes.json(),
            produtosRes.json(),
            bairrosRes.json()
          ]);

          // Processar configurações
          setConfig({
            telefone_whatsapp: configData.telefone_whatsapp || configData.whatsapp || '',
            moeda: configData.moeda || 'BRL',
            nome_loja: configData.nome_loja || configData.Loja || 'Loja',
            pedido_minimo_entrega: configData.pedido_minimo_entrega || 0,
            mensagem_retirada: configData.mensagem_retirada || 'Retire em 20 minutos'
          });

          // Processar categorias
          let processedCategorias: Categoria[] = [];
          
          if (Array.isArray(categoriasData)) {
            processedCategorias = categoriasData.map((cat: any) => ({
              id: cat.id?.toString() || '',
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
              id: prod.id?.toString() || prod.produto_id?.toString() || '',
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
        }

        console.log('📊 Dados carregados com sucesso:', {
          categorias: categorias.length,
          produtos: produtos.length,
          bairros: bairros.length
        });

      } catch (err: any) {
        console.error('❌ Erro ao buscar dados:', err);
        setError(err.message || 'Erro ao carregar dados');
        
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
    };

    fetchData();
  }, []);

  // Função para recarregar dados
  const refreshData = () => {
    setLoading(true);
    setError(null);
    fetchData();
  };

  return { 
    config, 
    categorias, 
    produtos, 
    bairros, 
    loading, 
    error,
    refreshData 
  };
};