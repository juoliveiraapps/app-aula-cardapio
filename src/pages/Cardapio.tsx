import React, { useState, useMemo, useEffect } from 'react';
import { useCardapioData } from '../hooks/useCardapioData';
import { Link } from 'react-router-dom'; 
import { Produto, ItemCarrinho } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import BarraBusca from '../components/Cardapio/BarraBusca';
import CategoriasMenu from '../components/Cardapio/CategoriasMenu';
import CategoriaSection from '../components/Cardapio/CategoriaSection';
import Carrinho from '../components/Cardapio/Carrinho';
import ModalEntrega from '../components/Cardapio/ModalEntrega';
import ModalComandas from '../components/Cardapio/ModalComandas';
import ModalCheckout from '../components/Cardapio/ModalCheckout';
import BotaoCarrinhoFlutuante from '../components/Cardapio/BotaoCarrinhoFlutuante';
import BotaoWhatsAppFlutuante from '../components/UI/BotaoWhatsAppFlutuante';
import {
  salvarPedidoNoSheet,
  formatarMensagemWhatsApp,
  enviarParaWhatsApp,
  formatarItensParaSheet,
  PedidoParaSheet
} from '../services/sheetService';

const Cardapio: React.FC = () => {
  const { config, categorias, produtos, loading } = useCardapioData();
  
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [modalEntregaAberto, setModalEntregaAberto] = useState(false);
  const [modalComandasAberto, setModalComandasAberto] = useState(false);
  const [modalCheckoutAberto, setModalCheckoutAberto] = useState(false);
  const [tipoEntrega, setTipoEntrega] = useState<'local' | 'retirada' | 'delivery' | null>(null);
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([]);
  const [comandaNumero, setComandaNumero] = useState<string>('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [enviandoParaSheet, setEnviandoParaSheet] = useState(false);
  const [whatsappBloqueado, setWhatsappBloqueado] = useState<string | null>(null);

  // Função para lidar com seleção de comanda:
  const handleSelecionarComanda = (numero: string, nome: string) => {
    setComandaNumero(numero);
    setNomeCliente(nome);
    setModalComandasAberto(false);
    setModalCheckoutAberto(true);
  };

  // Função para lidar com seleção de tipo de entrega:
  const handleConfirmarTipoEntrega = (tipo: 'local' | 'retirada' | 'delivery') => {
    setTipoEntrega(tipo);
    setModalEntregaAberto(false);
    
    if (tipo === 'local') {
      setModalComandasAberto(true);
    } else {
      setModalCheckoutAberto(true);
    }
  };

  // useEffect para carregar carrinho
  useEffect(() => {
    const saved = localStorage.getItem('carrinho');
    if (saved) {
      try {
        setItensCarrinho(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    }
  }, []);

  // useEffect para salvar carrinho
  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itensCarrinho));
  }, [itensCarrinho]);

  // Função para calcular preço unitário
  const calcularPrecoUnitario = (produto: Produto, opcoes: { [key: string]: string } = {}) => {
    let precoUnitario = Number(produto.preco) || 0;
    
    Object.values(opcoes).forEach(opcaoId => {
      produto.opcoes?.forEach(grupo => {
        const opcao = grupo.opcoes.find(o => o.id === opcaoId);
        if (opcao) precoUnitario += Number(opcao.acrescimo) || 0;
      });
    });
    
    return precoUnitario;
  };

  // Função adicionar ao carrinho - CORRIGIDA
  const adicionarAoCarrinho = (produto: Produto, opcoes: { [key: string]: string } = {}, observacao: string = '', quantidade: number = 1) => {
    console.log('🛒 Cardapio: Adicionando ao carrinho', {
      produto: produto.nome,
      quantidade,
      opcoes,
      observacao
    });
    
    const estaDisponivel = produto.disponivel === true || produto.disponivel === 'TRUE' || produto.disponivel === '1';
    if (!estaDisponivel) return;

    const precoUnitario = calcularPrecoUnitario(produto, opcoes);

    const novoItem: ItemCarrinho = {
      produto,
      quantidade: quantidade, // ← AGORA USA O PARÂMETRO
      opcoesSelecionadas: opcoes,
      precoTotal: precoUnitario * quantidade, // ← CALCULA COM O PARÂMETRO
      observacao
    };

    setItensCarrinho(prev => {
      const existingIndex = prev.findIndex(item => 
        item.produto.produto_id === produto.produto_id &&
        JSON.stringify(item.opcoesSelecionadas) === JSON.stringify(opcoes) &&
        item.observacao === observacao
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const existingItem = updated[existingIndex];
        const precoUnitarioAtual = calcularPrecoUnitario(produto, opcoes);
        updated[existingIndex] = {
          ...existingItem,
          quantidade: existingItem.quantidade + quantidade,
          precoTotal: (existingItem.quantidade + quantidade) * precoUnitarioAtual
        };
        return updated;
      } else {
        return [...prev, novoItem];
      }
    });
  };

  // Função atualizar quantidade
  const atualizarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade < 1) {
      removerDoCarrinho(index);
      return;
    }

    setItensCarrinho(prev => {
      const updated = [...prev];
      const item = updated[index];
      const precoUnitario = calcularPrecoUnitario(item.produto, item.opcoesSelecionadas);
      updated[index] = {
        ...item,
        quantidade: novaQuantidade,
        precoTotal: novaQuantidade * precoUnitario
      };
      return updated;
    });
  };

  // Função remover do carrinho
  const removerDoCarrinho = (index: number) => {
    setItensCarrinho(prev => prev.filter((_, i) => i !== index));
  };

  // Função limpar carrinho
  const limparCarrinho = () => {
    setItensCarrinho([]);
  };

  // Cálculos
  const subtotal = itensCarrinho.reduce((total, item) => total + (Number(item.precoTotal) || 0), 0);
  const totalItens = itensCarrinho.reduce((total, item) => total + (Number(item.quantidade) || 0), 0);
  const taxaEntrega = tipoEntrega === 'delivery' ? 5 : 0;
  const total = subtotal + taxaEntrega;

  const mostrarToast = (mensagem: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
    if (typeof window === 'undefined') return;

    const toast = document.createElement('div');
    toast.className = `fixed top-6 right-6 z-[200] px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 transform ${
      tipo === 'sucesso' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${tipo === 'sucesso'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
          }
        </svg>
        <span class="font-bold">${mensagem}</span>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateY(-1rem)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const handleFinalizarPedido = async (dados: any) => {
    setEnviandoParaSheet(true);

    try {
      const pedidoSheet: PedidoParaSheet = {
        cliente: nomeCliente || dados.nome || `Comanda ${comandaNumero}`,
        telefone: dados.telefone || 'Não informado',
        tipo: tipoEntrega!,
        formaPagamento: dados.formaPagamento || 'local',
        observacoes: dados.observacoes || '',
        itens: formatarItensParaSheet(itensCarrinho),
        subtotal,
        total,
      };

      if (tipoEntrega === 'local') {
        pedidoSheet.comandaNumero = comandaNumero;
      } else if (tipoEntrega === 'delivery') {
        pedidoSheet.endereco = dados.endereco;
        pedidoSheet.numero = dados.numero;
        pedidoSheet.complemento = dados.complemento;
        pedidoSheet.referencia = dados.referencia;
        pedidoSheet.taxa_entrega = 5;
      }

      console.log('📤 Enviando pedido completo:', pedidoSheet);
      const resultadoSheet = await salvarPedidoNoSheet(pedidoSheet);

      if (resultadoSheet.success) {
        console.log('✅ Pedido salvo no Sheet com ID:', resultadoSheet.pedido_id);

        if (tipoEntrega === 'local') {
          mostrarToast(`Pedido registrado na Comanda ${comandaNumero}!`, 'sucesso');
        } else if ((tipoEntrega === 'retirada' || tipoEntrega === 'delivery') && dados.querWhatsApp) {
          mostrarToast('Pedido registrado! Abrindo WhatsApp...', 'sucesso');

          const mensagemWhatsApp = formatarMensagemWhatsApp(
            itensCarrinho,
            dados,
            tipoEntrega,
            comandaNumero,
            config
          );

          setTimeout(() => {
            const resultado = enviarParaWhatsApp(mensagemWhatsApp, config.telefone_whatsapp, true);

            if (resultado.popupBloqueado) {
              console.warn('⚠️ Popup bloqueado, mostrando botão flutuante');
              setWhatsappBloqueado(resultado.url);
            }
          }, 500);
        } else {
          mostrarToast('Pedido registrado com sucesso!', 'sucesso');
        }

        setModalCheckoutAberto(false);
        limparCarrinho();
        setTipoEntrega(null);
        setComandaNumero('');
        setNomeCliente('');
      } else {
        console.error('❌ Erro do Sheet:', resultadoSheet);
        throw new Error(resultadoSheet.message || 'Erro ao salvar no Sheet');
      }

    } catch (error: any) {
      console.error('❌ Erro ao processar pedido:', error);
      mostrarToast(`Erro: ${error.message || 'Tente novamente'}`, 'erro');
    } finally {
      setEnviandoParaSheet(false);
    }
  };

  // Filtros
  const produtosPorCategoria = useMemo(() => {
    const agrupados: { [key: string]: any[] } = {};
    
    categorias.forEach(categoria => {
      agrupados[categoria.categoria_id] = [];
    });

    produtos.forEach(produto => {
      if (agrupados[produto.categoria_id]) {
        agrupados[produto.categoria_id].push(produto);
      }
    });

    return agrupados;
  }, [produtos, categorias]);

  const produtosFiltrados = useMemo(() => {
    let produtosFinais = produtosPorCategoria;

    if (categoriaAtiva) {
      produtosFinais = { [categoriaAtiva]: produtosPorCategoria[categoriaAtiva] || [] };
    }

    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      const filtrados: { [key: string]: any[] } = {};

      Object.keys(produtosFinais).forEach(categoriaId => {
        const produtosDaCategoria = produtosFinais[categoriaId] || [];
        const produtosFiltrados = produtosDaCategoria.filter(produto =>
          produto.nome.toLowerCase().includes(termo) ||
          produto.descricao?.toLowerCase().includes(termo)
        );

        if (produtosFiltrados.length > 0) {
          filtrados[categoriaId] = produtosFiltrados;
        }
      });

      produtosFinais = filtrados;
    }

    return produtosFinais;
  }, [produtosPorCategoria, categoriaAtiva, termoBusca]);

  const temProdutos = Object.values(produtosFiltrados).some(prods => prods.length > 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-4 md:py-8">
      <div className="max-w-[970px] mx-auto px-4">

        {/* Header do Cardápio */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl overflow-hidden mb-4 md:mb-8 border border-gray-200">
          <div className="p-4 md:p-6">
            <div className="flex items-center space-x-3 md:space-x-6">
              <img 
  src="/logo-cardapio.png"
  alt="Roast Coffee"
  className="h-32 w-auto"  // Aumenta para 6rem (96px)
  loading="lazy"
/>
              <div className="flex-1">
                <h1 className="text-xl md:text-3xl font-bold text-primary-900 mb-0.5 md:mb-1">Roast Coffee</h1>
                <p className="text-primary-600 text-sm md:text-lg">O melhor café da região</p>
              </div>
            </div>
          </div>

          <CategoriasMenu
            categorias={categorias}
            categoriaAtiva={categoriaAtiva}
            onCategoriaChange={setCategoriaAtiva}
          />
        </div>

        {/* Barra de Busca */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 mb-4 md:mb-6 border border-gray-200">
          <BarraBusca
            termoBusca={termoBusca}
            onBuscaChange={setTermoBusca}
          />
        </div>

        {/* Conteúdo do Cardápio */}
        <div className="space-y-4 md:space-y-6">
          {categorias.map(categoria => {
            const produtosDaCategoria = produtosFiltrados[categoria.categoria_id] || [];
            
            if (produtosDaCategoria.length === 0) return null;

            return (
              <CategoriaSection
                key={categoria.categoria_id}
                categoria={categoria}
                produtos={produtosDaCategoria}
                onAdicionarAoCarrinho={adicionarAoCarrinho}
              />
            );
          })}

          {!temProdutos && (
            <div className="bg-white rounded-xl md:rounded-3xl shadow-lg md:shadow-xl p-8 md:p-12 text-center border border-gray-200">
              <div className="text-4xl md:text-6xl mb-4 md:mb-6">
                {termoBusca || categoriaAtiva ? '🔍' : '☕'}
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-primary-600 mb-2 md:mb-4">
                {termoBusca ? 'Nenhum produto encontrado' :
                 categoriaAtiva ? 'Nenhum produto nesta categoria' :
                 'Nenhum produto disponível'}
              </h3>
              <p className="text-primary-500 text-sm md:text-lg">
                {termoBusca ? 'Tente buscar com outros termos' :
                 categoriaAtiva ? 'Tente selecionar outra categoria' :
                 'Em breve teremos novidades!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botão Flutuante do Carrinho */}
      {totalItens > 0 && (
        <BotaoCarrinhoFlutuante
          totalItens={totalItens}
          subtotal={subtotal}
          onClick={() => setCarrinhoAberto(true)}
        />
      )}

      {/* Modal do Carrinho */}
      <Carrinho
        itens={itensCarrinho}
        isOpen={carrinhoAberto}
        onClose={() => setCarrinhoAberto(false)}
        onAtualizarQuantidade={atualizarQuantidade}
        onRemoverItem={removerDoCarrinho}
        onLimparCarrinho={limparCarrinho}
        onIniciarCheckout={() => {
          setCarrinhoAberto(false);
          setModalEntregaAberto(true);
        }}
        pedidoMinimo={0}
      />

      {/* Modal de Entrega */}
      <ModalEntrega
        isOpen={modalEntregaAberto}
        onClose={() => setModalEntregaAberto(false)}
        itens={itensCarrinho}
        subtotal={subtotal}
        onConfirmarTipoEntrega={handleConfirmarTipoEntrega}
      />

      {/* Modal de Comandas */}
      <ModalComandas
        isOpen={modalComandasAberto}
        onClose={() => {
          setModalComandasAberto(false);
          setModalEntregaAberto(true);
        }}
        onSelecionarComanda={handleSelecionarComanda}
      />

      {/* Modal de Checkout Final */}
      {tipoEntrega && (
        <ModalCheckout
          isOpen={modalCheckoutAberto}
          onClose={() => {
            setModalCheckoutAberto(false);
            setTipoEntrega(null);
            setComandaNumero('');
            setNomeCliente('');
          }}
          itens={itensCarrinho}
          tipoEntrega={tipoEntrega}
          comandaNumero={comandaNumero}
          pedidoMinimo={0}
          config={config}
          enviando={enviandoParaSheet}
          onFinalizarPedido={handleFinalizarPedido}
        />
      )}

      {/* Botão Flutuante WhatsApp se popup foi bloqueado */}
      {whatsappBloqueado && (
        <BotaoWhatsAppFlutuante
          url={whatsappBloqueado}
          onClose={() => setWhatsappBloqueado(null)}
        />
      )}
    </div>
  );
};

export default Cardapio;