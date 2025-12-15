// hooks/useCardapioData.ts
import { useState, useEffect } from 'react';
import { Config, Categoria, Produto, Bairro } from '../types';

// Use a URL base do seu projeto Vercel
const getApiBase = () => {
  if (typeof window === 'undefined') return '';

  // Em desenvolvimento, usa a mesma origem (localhost:5173 com proxy do Vite)
  // Em produção, usa a origem do domínio (Vercel)
  return window.location.origin;
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

        const API_BASE = getApiBase();
        
        // Fallback para ambiente de build (SSR)
        if (!API_BASE) {
          console.log('Ambiente de build - usando dados estáticos');
          setConfig({
            telefone_whatsapp: '5511999999999',
            moeda: 'BRL',
            nome_loja: 'Coffee House',
            pedido_minimo_entrega: 0,
            mensagem_retirada: 'Retire em 20 minutos'
          });
          setCategorias([]);
          setProdutos([]);
          setBairros([]);
          setLoading(false);
          return;
        }

        console.log('Usando API base:', API_BASE);

        // Buscar dados em paralelo - URLs CORRETAS: /api?action=
        const [configRes, categoriasRes, produtosRes, bairrosRes] = await Promise.all([
        fetch(`/api?action=getConfig`),
        fetch(`/api?action=getCategorias`),
        fetch(`/api?action=getProdutos`),
        fetch(`/api?action=getBairros`)
        ]);

        // Verificar se todas as respostas são OK
        if (!configRes.ok || !categoriasRes.ok || !produtosRes.ok || !bairrosRes.ok) {
          throw new Error('Erro ao buscar dados da API');
        }

        const [configData, categoriasData, produtosData, bairrosData] = await Promise.all([
          configRes.json(),
          categoriasRes.json(),
          produtosRes.json(),
          bairrosRes.json()
        ]);

        setConfig({
          telefone_whatsapp: configData.telefone_whatsapp || '',
          moeda: configData.moeda || 'BRL',
          nome_loja: configData.nome_loja || '',
          pedido_minimo_entrega: configData.pedido_minimo_entrega || 0,
          mensagem_retirada: configData.mensagem_retirada
        });

        // PROCESSAMENTO CORRIGIDO DAS CATEGORIAS
        let processedCategorias: Categoria[] = [];
        
        if (categoriasData.success && Array.isArray(categoriasData.categories)) {
          // Nova estrutura: { success: true, categories: [...] }
          processedCategorias = categoriasData.categories.map((cat: any) => ({
            id: cat.id?.toString() || '',
            nome: cat.nome?.toString() || '',
            descricao: cat.descricao?.toString() || '',
            posicao: parseInt(cat.posicao) || parseInt(cat.posição) || 1,
            visivel: cat.visivel === true || cat.visivel === 'TRUE' || cat.visivel === '1' || cat.visível === true,
            icone_svg: cat.icone_svg?.toString() || cat.icone?.toString() || 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
          }));
        } else if (Array.isArray(categoriasData)) {
          // Estrutura antiga: array direto
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

        console.log('📊 Dados carregados:', {
          categorias: processedCategorias.length,
          produtos: processedProdutos.length,
          bairros: processedBairros.length
        });

      } catch (err: any) {
        console.error('Erro ao buscar dados:', err);
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

  return { config, categorias, produtos, bairros, loading, error };
};