// hooks/useCardapioData.ts
import { useState, useEffect } from 'react';
import { Config, Categoria, Produto, Bairro } from '../types';

// Use a URL base do seu projeto Vercel
const getApiBase = () => {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;
  const origin = window.location.origin;

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return origin;
  }

  return 'http://localhost:3000';
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
            nome_loja: 'Roast Coffee',
            pedido_minimo_entrega: 0,
            mensagem_retirada: 'Retire em 15 minutos'
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
          fetch(`${API_BASE}/api?action=getConfig`),
          fetch(`${API_BASE}/api?action=getCategorias`),
          fetch(`${API_BASE}/api?action=getProdutos`),
          fetch(`${API_BASE}/api?action=getBairros`)
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
        setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
        setProdutos(Array.isArray(produtosData) ? produtosData : []);
        setBairros(Array.isArray(bairrosData) ? bairrosData : []);

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { config, categorias, produtos, bairros, loading, error };
};