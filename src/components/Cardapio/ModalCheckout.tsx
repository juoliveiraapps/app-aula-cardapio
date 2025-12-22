import React, { useState, useEffect } from 'react';
import { ItemCarrinho } from '../../types';
import { enviarParaWhatsApp } from '../../services/sheetService';

interface ModalCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  itens: ItemCarrinho[];
  tipoEntrega: 'local' | 'retirada' | 'delivery';
  comandaNumero?: string;
  pedidoMinimo: number;
  config: any;
  enviando?: boolean;
  onFinalizarPedido: (dados: {
    nome?: string;
    telefone?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    referencia?: string;
    observacoes?: string;
    formaPagamento?: string;
    comanda?: string;
    querWhatsApp?: boolean;
    taxa_entrega?: number;
    codigo_cupom?: string;
  }) => Promise<any>;
}

export const ModalCheckout: React.FC<ModalCheckoutProps> = ({
  isOpen,
  onClose,
  itens,
  tipoEntrega,
  comandaNumero,
  pedidoMinimo,
  config,
  enviando = false,
  onFinalizarPedido
}) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [referencia, setReferencia] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepValido, setCepValido] = useState(false);
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
  const [querWhatsApp, setQuerWhatsApp] = useState(true);
  
  // Estados para cupom
  const [codigoCupom, setCodigoCupom] = useState('');
  const [validandoCupom, setValidandoCupom] = useState(false);
  const [cupomValido, setCupomValido] = useState<any>(null);
  const [cupomErro, setCupomErro] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(false);
  
  // Estados para taxa dinâmica
  const [taxaEntrega, setTaxaEntrega] = useState(5);
  const [bairrosCadastrados, setBairrosCadastrados] = useState<any[]>([]);
  const [tempoEntrega, setTempoEntrega] = useState('30-40 minutos');

  const subtotal = itens.reduce((total, item) => total + item.precoTotal, 0);
  const descontoCupom = cupomValido ? cupomValido.valor_calculado || 0 : 0;
  const subtotalComDesconto = Math.max(0, subtotal - descontoCupom);
  const total = subtotalComDesconto + (tipoEntrega === 'delivery' ? taxaEntrega : 0);
  const totalItens = itens.reduce((total, item) => total + item.quantidade, 0);

  // Função para validar cupom
  const validarCupomFrontend = async () => {
    if (!codigoCupom.trim()) {
      setCupomErro('Digite um código de cupom');
      return;
    }

    setValidandoCupom(true);
    setCupomErro('');

    try {
      const resposta = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          key: 'cce4d5770afe09d2c790dcca4272e1190462a6a574270b040c835889115c6914', // Use sua API key
          action: 'validarCupom',
          codigo: codigoCupom.trim().toUpperCase(),
          subtotal: subtotal.toString()
        })
      });

      const resultado = await resposta.json();
      
      if (resultado.valido) {
        setCupomValido(resultado);
        setCupomAplicado(true);
        setCupomErro('');
        
        // Verificar se o cupom é específico para retirada ou delivery
        const cupomData = resultado.cupom || {};
        const cupomInfo = cupomData.cupom_info || '';
        
        if (cupomInfo.includes('apenas_retirada') && tipoEntrega !== 'retirada') {
          setCupomErro('Este cupom é válido apenas para retirada no local');
          setCupomValido(null);
          setCupomAplicado(false);
          return;
        }
        
        if (cupomInfo.includes('apenas_delivery') && tipoEntrega !== 'delivery') {
          setCupomErro('Este cupom é válido apenas para delivery');
          setCupomValido(null);
          setCupomAplicado(false);
          return;
        }
        
      } else {
        setCupomValido(null);
        setCupomAplicado(false);
        setCupomErro(resultado.mensagem || 'Cupom inválido');
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      setCupomErro('Erro ao validar cupom. Tente novamente.');
      setCupomValido(null);
      setCupomAplicado(false);
    } finally {
      setValidandoCupom(false);
    }
  };

  // Remover cupom
  const removerCupom = () => {
    setCodigoCupom('');
    setCupomValido(null);
    setCupomAplicado(false);
    setCupomErro('');
  };

  // Função para buscar bairros da planilha
  const buscarBairrosDaPlanilha = async () => {
    try {
      const response = await fetch('/api?action=getBairros');
      if (response.ok) {
        const data = await response.json();
        const bairrosArray = Array.isArray(data) ? data : data.bairros || [];
        setBairrosCadastrados(bairrosArray);
      }
    } catch (error) {
      console.error('Erro ao buscar bairros:', error);
    }
  };

  // Calcular taxa e tempo por bairro
  const calcularTaxaPorBairro = (nomeBairro: string) => {
    if (!nomeBairro || bairrosCadastrados.length === 0) {
      console.log('Bairro vazio ou lista vazia');
      setTaxaEntrega(5);
      setTempoEntrega('30-40 minutos');
      return;
    }
    
    const normalizarTexto = (texto: string) => {
      return texto
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
    };
    
    const bairroNormalizado = normalizarTexto(nomeBairro);
    
    const bairroEncontrado = bairrosCadastrados.find(b => {
      if (!b.Bairro) return false;
      
      const bairroCadastradoNormalizado = normalizarTexto(b.Bairro.toString());
      
      const matchExato = bairroCadastradoNormalizado === bairroNormalizado;
      const matchContem = bairroCadastradoNormalizado.includes(bairroNormalizado) || 
                         bairroNormalizado.includes(bairroCadastradoNormalizado);
      
      return (matchExato || matchContem) && b.ativo !== false;
    });
    
    if (bairroEncontrado) {
      console.log('✅ Bairro encontrado:', bairroEncontrado.Bairro, 'Taxa:', bairroEncontrado.taxa_entrega);
      setTaxaEntrega(parseFloat(bairroEncontrado.taxa_entrega) || 5);
      
      const tempoMin = parseInt(bairroEncontrado.tempo_min) || 30;
      const tempoMax = parseInt(bairroEncontrado.tempo_max) || 40;
      setTempoEntrega(`${tempoMin}-${tempoMax} minutos`);
    } else {
      console.log('❌ Bairro NÃO encontrado:', nomeBairro);
      
      const palavrasBairro = bairroNormalizado.split(' ');
      const bairroFallback = bairrosCadastrados.find(b => {
        if (!b.Bairro || b.ativo === false) return false;
        const bairroCad = normalizarTexto(b.Bairro.toString());
        
        return palavrasBairro.some(palavra => 
          palavra.length > 3 && bairroCad.includes(palavra)
        );
      });
      
      if (bairroFallback) {
        console.log('✅ Bairro encontrado por fallback:', bairroFallback.Bairro);
        setTaxaEntrega(parseFloat(bairroFallback.taxa_entrega) || 5);
        const tempoMin = parseInt(bairroFallback.tempo_min) || 30;
        const tempoMax = parseInt(bairroFallback.tempo_max) || 40;
        setTempoEntrega(`${tempoMin}-${tempoMax} minutos`);
      } else {
        setTaxaEntrega(0);
        setTempoEntrega('Não atendemos este bairro');
      }
    }
  };

  // Buscar bairros quando abrir modal
  useEffect(() => {
    if (isOpen && tipoEntrega === 'delivery') {
      buscarBairrosDaPlanilha();
    }
  }, [isOpen, tipoEntrega]);

  // Buscar endereço pelo CEP
  const buscarCep = async () => {
    if (cep.length === 8) {
      setBuscandoCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setEndereco(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setCepValido(true);
          
          if (data.bairro) {
            calcularTaxaPorBairro(data.bairro);
          }
        } else {
          setCepValido(false);
          setTaxaEntrega(5);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setCepValido(false);
        setTaxaEntrega(5);
      } finally {
        setBuscandoCep(false);
      }
    } else {
      setCepValido(false);
      setTaxaEntrega(5);
    }
  };

  // Efeito para buscar CEP quando terminar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cep.length === 8) {
        buscarCep();
      } else {
        setCepValido(false);
        setTaxaEntrega(5);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [cep]);

  // Efeito para recalcular taxa quando bairro mudar manualmente
  useEffect(() => {
    if (bairro && bairrosCadastrados.length > 0) {
      const timer = setTimeout(() => {
        calcularTaxaPorBairro(bairro);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [bairro, bairrosCadastrados]);

  // Resetar campos quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      if (tipoEntrega === 'local' && comandaNumero) {
        setMostrarModalConfirmacao(true);
      } else {
        setNome('');
        setTelefone('');
        setCep('');
        setEndereco('');
        setNumero('');
        setComplemento('');
        setBairro('');
        setCidade('');
        setReferencia('');
        setObservacoes('');
        setFormaPagamento('dinheiro');
        setCepValido(false);
        setQuerWhatsApp(true);
        setTaxaEntrega(5);
        setTempoEntrega('30-40 minutos');
        setMostrarModalConfirmacao(false);
        
        // Resetar cupom
        setCodigoCupom('');
        setCupomValido(null);
        setCupomAplicado(false);
        setCupomErro('');
      }
    }
  }, [isOpen, tipoEntrega, comandaNumero]);

  // Função para formatar opções dos itens
  const formatarOpcoesItem = (item: ItemCarrinho) => {
    const opcoes: string[] = [];
    
    item.produto.opcoes?.forEach(grupo => {
      const opcaoId = item.opcoesSelecionadas[grupo.id];
      if (opcaoId) {
        const opcao = grupo.opcoes.find(o => o.id === opcaoId);
        if (opcao) {
          opcoes.push(opcao.rotulo);
        }
      }
    });
    
    return opcoes.length > 0 ? ` (${opcoes.join(', ')})` : '';
  };

  // Função para gerar mensagem do pedido
  const gerarMensagemPedido = (pedidoId: string) => {
    let mensagem = `*NOVO PEDIDO #${pedidoId}*\n\n`;
    mensagem += `👤 *Cliente:* ${nome || 'Consumo Local'}\n`;
    
    if (telefone && tipoEntrega !== 'local') {
      mensagem += `📞 *Telefone:* ${telefone}\n`;
    }
    
    mensagem += `📍 *Tipo:* ${
      tipoEntrega === 'local' ? 'Consumo Local' : 
      tipoEntrega === 'retirada' ? 'Retirada' : 'Delivery'
    }\n`;
    
    if (tipoEntrega === 'delivery') {
      mensagem += `🏠 *Endereço:* ${endereco}, ${numero}\n`;
      if (complemento) mensagem += `🏢 *Complemento:* ${complemento}\n`;
      mensagem += `🗺️ *Bairro:* ${bairro}\n`;
      mensagem += `💰 *Taxa entrega:* R$ ${taxaEntrega.toFixed(2)}\n`;
    }
    
    if (tipoEntrega === 'local' && comandaNumero) {
      mensagem += `🏷️ *Comanda:* #${comandaNumero}\n`;
    }
    
    // Adicionar informação do cupom se aplicado
    if (cupomValido && cupomAplicado) {
      mensagem += `🎫 *Cupom:* ${cupomValido.codigo}\n`;
      mensagem += `💸 *Desconto:* R$ ${cupomValido.valor_calculado?.toFixed(2) || '0.00'}\n`;
    }
    
    mensagem += `\n*ITENS:*\n`;
    itens.forEach((item) => {
      const opcoesFormatadas = formatarOpcoesItem(item);
      mensagem += `${item.quantidade}x ${item.produto.nome}${opcoesFormatadas} - R$ ${item.precoTotal.toFixed(2)}\n`;
    });
    
    mensagem += `\n*RESUMO FINANCEIRO:*\n`;
    mensagem += `Subtotal: R$ ${subtotal.toFixed(2)}\n`;
    
    if (cupomValido && cupomAplicado) {
      mensagem += `Desconto: -R$ ${cupomValido.valor_calculado?.toFixed(2) || '0.00'}\n`;
      mensagem += `Subtotal com desconto: R$ ${subtotalComDesconto.toFixed(2)}\n`;
    }
    
    if (tipoEntrega === 'delivery') {
      mensagem += `Taxa entrega: R$ ${taxaEntrega.toFixed(2)}\n`;
    }
    
    mensagem += `*TOTAL: R$ ${total.toFixed(2)}*\n`;
    mensagem += `💳 *Pagamento:* ${
      formaPagamento === 'dinheiro' ? 'Dinheiro' : 
      formaPagamento === 'cartao' ? 'Cartão na entrega/retirada' : 'PIX'
    }\n`;
    
    if (observacoes) {
      mensagem += `📝 *Observações:* ${observacoes}\n`;
    }
    
    return mensagem;
  };

  // Função para processar resposta e abrir WhatsApp
  const handleRespostaPedido = (resposta: any) => {
    if (resposta.success) {
      console.log('✅ Pedido salvo, ID:', resposta.pedido_id);
      
      const mensagemPedido = gerarMensagemPedido(resposta.pedido_id);
      const telefoneEstabelecimento = config?.telefone_whatsapp || '';
      
      console.log('📱 Config WhatsApp:', {
        temTelefone: !!telefoneEstabelecimento,
        telefone: telefoneEstabelecimento,
        querWhatsApp: querWhatsApp
      });
      
      if (querWhatsApp && telefoneEstabelecimento) {
        console.log('🔄 Preparando para abrir WhatsApp...');
        
        setTimeout(() => {
          try {
            const resultado = enviarParaWhatsApp(
              mensagemPedido, 
              telefoneEstabelecimento,
              true
            );
            
            if (!resultado.sucesso) {
              console.warn('⚠️ WhatsApp não abriu automaticamente');
              if (confirm('WhatsApp não abriu automaticamente. Deseja copiar o link?')) {
                navigator.clipboard.writeText(resultado.url);
                alert('Link copiado! Cole no WhatsApp.');
              }
            }
          } catch (error) {
            console.error('❌ Erro ao abrir WhatsApp:', error);
          }
        }, 1500);
      } else {
        console.log('ℹ️ WhatsApp não solicitado ou telefone não configurado');
      }
      
      onClose();
    }
  };

  // Função para finalizar pedido (retirada e delivery)
  const handleFinalizarOutrosTipos = async () => {
    if (!nome || !telefone) {
      alert('Por favor, preencha seu nome e telefone.');
      return;
    }

    if (tipoEntrega === 'delivery' && (!cepValido || !endereco || !numero || !bairro || !cidade)) {
      alert('Por favor, preencha todos os campos obrigatórios do endereço.');
      return;
    }

    if (tipoEntrega === 'delivery' && taxaEntrega === 0) {
      alert('Não atendemos este bairro. Por favor, verifique o endereço ou escolha retirada.');
      return;
    }

    try {
      const dadosPedido = {
        nome,
        telefone,
        ...(tipoEntrega === 'delivery' && {
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          referencia,
          taxa_entrega: taxaEntrega
        }),
        observacoes,
        formaPagamento,
        querWhatsApp,
        codigo_cupom: cupomAplicado ? codigoCupom.trim().toUpperCase() : ''
      };
      
      const resposta = await onFinalizarPedido(dadosPedido);
      handleRespostaPedido(resposta);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
    }
  };

  const handleConfirmarPedidoLocal = async () => {
    try {
      const resposta = await onFinalizarPedido({
        observacoes,
        formaPagamento: 'local',
        comanda: comandaNumero,
        querWhatsApp: false
      });
      
      handleRespostaPedido(resposta);
    } catch (error) {
      console.error('Erro ao confirmar pedido local:', error);
    }
  };

  // Modal de confirmação para consumo no local
  if (mostrarModalConfirmacao && tipoEntrega === 'local') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-[#e58840] text-[#400b0b] p-6 text-center shadow-md">
            <h2 className="text-2xl font-bold">Confirmar Pedido</h2>
            <p className="text-[#400b0b]/80 mt-1">
              Comanda #{comandaNumero}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#e58840]/20 text-[#400b0b] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#400b0b] mb-2">
                Confirmar pedido para Comanda #{comandaNumero}?
              </h3>
              <p className="text-[#400b0b]/80 mb-4">
                Seu pedido será enviado para a cozinha e servido na sua mesa.
              </p>

              <div className="bg-[#e58840]/5 rounded-xl p-4 mb-6 text-left border border-[#400b0b]/10">
                <h4 className="font-bold text-[#400b0b] mb-3">Resumo do Pedido</h4>
                <div className="space-y-3">
                  {itens.map((item, index) => {
                    const opcoesFormatadas = formatarOpcoesItem(item);
                    return (
                      <div key={index} className="flex justify-between">
                        <div>
                          <span className="text-sm font-medium text-[#400b0b]">{item.quantidade}x {item.produto.nome}</span>
                          {opcoesFormatadas && (
                            <p className="text-xs text-[#400b0b]/60 mt-1">{opcoesFormatadas}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-[#400b0b]">
                          {item.precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t border-[#400b0b]/10 mt-3">
                    <div className="flex justify-between font-bold text-[#400b0b]">
                      <span>Total:</span>
                      <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 text-left">
                <label className="block text-sm font-medium text-[#400b0b] mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Alguma observação sobre o pedido?"
                  className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent text-[#400b0b]"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[#400b0b]/10 flex gap-3">
            <button
              onClick={() => setMostrarModalConfirmacao(false)}
              className="flex-1 py-3 rounded-xl font-bold border-2 border-[#400b0b]/20 text-[#400b0b] hover:bg-[#e58840]/10 transition-all duration-300"
              disabled={enviando}
            >
              Voltar
            </button>
            <button
              onClick={handleConfirmarPedidoLocal}
              disabled={enviando}
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
                enviando
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#e58840] text-[#400b0b] hover:bg-[#e58840]/90 shadow-sm hover:shadow-md active:scale-[0.98]'
              }`}
            >
              {enviando ? (
                <>
                  <svg className="animate-spin h-5 w-5 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                'Confirmar Pedido'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-[#e58840] text-[#400b0b] p-4 text-center relative shadow-md">
          <h2 className="text-xl font-bold">Finalizar Pedido</h2>
          <p className="text-[#400b0b]/80 text-sm">
            {tipoEntrega === 'local' ? 'Consumo no Local' : 
             tipoEntrega === 'retirada' ? 'Retirada no Local' : 'Delivery'}
          </p>
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-8 h-8 bg-white/30 text-[#400b0b] rounded-full flex items-center justify-center hover:bg-white/40 transition-all duration-300"
            disabled={enviando}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* INFO DO TIPO DE ENTREGA */}
          <div className="mb-6">
            <div className={`p-4 rounded-xl border-2 ${
              tipoEntrega === 'local' 
                ? 'border-[#e58840]/50 bg-[#e58840]/10' 
                : tipoEntrega === 'retirada'
                ? 'border-[#e58840]/50 bg-[#e58840]/10'
                : 'border-[#e58840]/50 bg-[#e58840]/10'
            }`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  tipoEntrega === 'local' 
                    ? 'bg-[#e58840]/20 text-[#400b0b]' 
                    : tipoEntrega === 'retirada'
                    ? 'bg-[#e58840]/20 text-[#400b0b]'
                    : 'bg-[#e58840]/20 text-[#400b0b]'
                }`}>
                  {tipoEntrega === 'local' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ) : tipoEntrega === 'retirada' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#400b0b]">
                    {tipoEntrega === 'local' ? 'Consumo no Local' : 
                     tipoEntrega === 'retirada' ? 'Retirada no Local' : 'Delivery'}
                  </h3>
                  <p className="text-sm text-[#400b0b]/80 mt-1">
                    {tipoEntrega === 'local' 
                      ? 'Seu pedido será entregue à sua mesa'
                      : tipoEntrega === 'retirada'
                      ? 'Retire seu pedido no balcão'
                      : 'Entregaremos no seu endereço'}
                  </p>
                  
                  {tipoEntrega === 'local' && comandaNumero && (
                    <div className="mt-2 flex items-center">
                      <span className="text-xs font-medium bg-[#e58840] text-[#400b0b] px-2 py-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        Comanda #{comandaNumero}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-[#400b0b]/60 mt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tipoEntrega === 'local' 
                      ? 'Pronto em 15-20 minutos'
                      : tipoEntrega === 'retirada'
                      ? 'Pronto em 10-15 minutos'
                      : `${tempoEntrega} • Taxa de entrega: R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CUPOM DE DESCONTO - APENAS PARA RETIRADA E DELIVERY */}
          {(tipoEntrega === 'retirada' || tipoEntrega === 'delivery') && (
            <div className="mb-6">
              <h3 className="font-bold text-[#400b0b] mb-3">Cupom de Desconto</h3>
              
              {!cupomAplicado ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codigoCupom}
                      onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
                      placeholder="Digite o código do cupom"
                      disabled={validandoCupom || enviando}
                      className="flex-1 p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                    />
                    <button
                      onClick={validarCupomFrontend}
                      disabled={!codigoCupom.trim() || validandoCupom || enviando}
                      className={`bg-[#e58840] text-[#400b0b] px-4 rounded-lg font-medium transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed ${
                        codigoCupom.trim() && !validandoCupom ? 'hover:bg-[#e58840]/90' : ''
                      }`}
                    >
                      {validandoCupom ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : 'Aplicar'}
                    </button>
                  </div>
                  
                  {cupomErro && (
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {cupomErro}
                    </p>
                  )}
                  
                  <p className="text-xs text-[#400b0b]/60 mt-1">
                    Cupons válidos apenas para {tipoEntrega === 'retirada' ? 'retirada' : 'delivery'}.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800">Cupom Aplicado!</h4>
                        <p className="text-sm text-green-600">
                          {cupomValido?.mensagem || `Código: ${codigoCupom}`}
                        </p>
                        <p className="text-xs text-green-500 mt-1">
                          Desconto de R$ {cupomValido?.valor_calculado?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removerCupom}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                      disabled={enviando}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resumo do Pedido */}
          <div className="mb-6 bg-[#e58840]/5 rounded-xl p-4 border border-[#400b0b]/10">
            <h3 className="font-bold text-[#400b0b] mb-3">Resumo do Pedido</h3>
            <div className="space-y-3">
              {itens.map((item, index) => {
                const opcoesFormatadas = formatarOpcoesItem(item);
                const precoUnitario = (item.precoTotal / item.quantidade).toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                });
                
                return (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#400b0b]">
                        {item.quantidade}x {item.produto.nome}
                      </p>
                      {opcoesFormatadas && (
                        <p className="text-xs text-[#400b0b]/60 mt-1">
                          {opcoesFormatadas}
                        </p>
                      )}
                      <p className="text-xs text-[#400b0b]/50 mt-1">
                        {precoUnitario} cada
                      </p>
                      {item.observacao && (
                        <p className="text-xs text-[#400b0b]/40 italic mt-1">
                          Obs: {item.observacao}
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-sm whitespace-nowrap text-[#400b0b]">
                      {item.precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mostrar dados apenas para retirada e delivery */}
          {(tipoEntrega === 'retirada' || tipoEntrega === 'delivery') && (
            <>
              {/* Informações Pessoais */}
              <div className="mb-6">
                <h3 className="font-bold text-[#400b0b] mb-3">Seus Dados</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#400b0b] mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={enviando}
                      className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#400b0b] mb-1">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                      disabled={enviando}
                      className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço para Delivery */}
              {tipoEntrega === 'delivery' && (
                <div className="mb-6">
                  <h3 className="font-bold text-[#400b0b] mb-3">Endereço de Entrega</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#400b0b] mb-1">
                        CEP *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cep}
                          onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                          placeholder="00000-000"
                          maxLength={8}
                          required
                          disabled={enviando}
                          className="flex-1 p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                        />
                        <button
                          onClick={buscarCep}
                          disabled={cep.length !== 8 || buscandoCep || enviando}
                          className="bg-[#e58840] text-[#400b0b] px-4 rounded-lg hover:bg-[#e58840]/90 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                        >
                          {buscandoCep ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : 'Buscar'}
                        </button>
                      </div>
                      {buscandoCep && <p className="text-xs text-[#400b0b]/60 mt-1">Buscando endereço...</p>}
                      
                      {!buscandoCep && cep.length === 8 && !cepValido && (
                        <p className="text-sm text-red-600 mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          CEP não encontrado. Digite outro ou preencha manualmente.
                        </p>
                      )}
                    </div>

                    {/* Campos de endereço só aparecem após CEP válido */}
                    {cepValido && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[#400b0b] mb-1">
                            Endereço *
                          </label>
                          <input
                            type="text"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                            required
                            disabled={enviando}
                            className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                            placeholder="Rua, Avenida, etc."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-[#400b0b] mb-1">
                              Número *
                            </label>
                            <input
                              type="text"
                              value={numero}
                              onChange={(e) => setNumero(e.target.value)}
                              required
                              disabled={enviando}
                              className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                              placeholder="123"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#400b0b] mb-1">
                              Complemento
                            </label>
                            <input
                              type="text"
                              value={complemento}
                              onChange={(e) => setComplemento(e.target.value)}
                              disabled={enviando}
                              className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                              placeholder="Apto, Bloco, etc."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#400b0b] mb-1">
                            Bairro *
                          </label>
                          <input
                            type="text"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            required
                            disabled={enviando}
                            className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                          />
                          {taxaEntrega === 0 && (
                            <p className="text-sm text-red-600 mt-1">
                              ⚠️ Não atendemos este bairro
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#400b0b] mb-1">
                            Cidade *
                          </label>
                          <input
                            type="text"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            required
                            disabled={enviando}
                            className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#400b0b] mb-1">
                            Ponto de Referência
                          </label>
                          <textarea
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            rows={2}
                            disabled={enviando}
                            className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
                            placeholder="Ex: Próximo à farmácia, casa com portão azul..."
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Forma de Pagamento */}
              <div className="mb-6">
                <h3 className="font-bold text-[#400b0b] mb-3">Forma de Pagamento</h3>
                <div className="space-y-2">
                  {['dinheiro', 'cartao', 'pix'].map((forma) => (
                    <label 
                      key={forma} 
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                        formaPagamento === forma
                          ? 'bg-[#e58840] text-[#400b0b] border-2 border-[#e58840] shadow-md transform scale-[1.02]'
                          : 'bg-white text-[#400b0b] border-2 border-[#400b0b]/20 hover:border-[#e58840]/50 hover:bg-[#e58840]/5'
                      } ${enviando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                        formaPagamento === forma
                          ? 'border-[#400b0b] bg-[#400b0b]'
                          : 'border-[#400b0b]/40 bg-white'
                      }`}>
                        {formaPagamento === forma && (
                          <div className="w-2 h-2 rounded-full bg-[#e58840]"></div>
                        )}
                      </div>
                      
                      <input
                        type="radio"
                        name="formaPagamento"
                        value={forma}
                        checked={formaPagamento === forma}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                        disabled={enviando}
                        className="hidden"
                      />
                      
                      <div className="flex-1">
                        <span className={`font-medium ${
                          formaPagamento === forma ? 'font-bold' : ''
                        }`}>
                          {forma === 'dinheiro' ? 'Dinheiro' : 
                           forma === 'cartao' ? 'Cartão na entrega/retirada' : 
                           'PIX'}
                        </span>
                        
                        {forma === 'pix' && (
                          <p className={`text-xs mt-1 ${
                            formaPagamento === forma ? 'text-[#400b0b]/90' : 'text-[#400b0b]/60'
                          }`}>
                            QR Code será mostrado na confirmação
                          </p>
                        )}
                      </div>
                      
                      <div className={`ml-2 p-2 rounded-full ${
                        formaPagamento === forma 
                          ? 'bg-[#400b0b] text-[#e58840]' 
                          : 'bg-[#400b0b]/10 text-[#400b0b]'
                      }`}>
                        {forma === 'dinheiro' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : forma === 'cartao' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Opção WhatsApp (apenas para retirada e delivery) */}
              {(tipoEntrega === 'retirada' || tipoEntrega === 'delivery') && (
                <div className="mb-6">
                  <h3 className="font-bold text-[#400b0b] mb-3">Confirmação por WhatsApp</h3>
                  <label className={`flex items-start p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    querWhatsApp
                      ? 'bg-[#e58840]/10 border-2 border-[#e58840]'
                      : 'bg-[#e58840]/5 border-2 border-[#400b0b]/20 hover:border-[#400b0b]/30'
                  }`}>
                    <input
                      type="checkbox"
                      checked={querWhatsApp}
                      onChange={(e) => setQuerWhatsApp(e.target.checked)}
                      disabled={enviando}
                      className="mt-1 text-[#e58840] focus:ring-[#e58840] w-5 h-5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg
                          className="w-5 h-5 text-[#400b0b]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        <span className="font-bold text-[#400b0b]">
                          Enviar confirmação pelo WhatsApp
                        </span>
                        {querWhatsApp && (
                          <span className="text-xs bg-[#e58840] text-[#400b0b] px-2 py-0.5 rounded-full font-bold">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#400b0b]/80 mt-1">
                        O WhatsApp abrirá automaticamente após o pedido ser registrado para você confirmar com o restaurante
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </>
          )}

          {/* Observações */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#400b0b] mb-2">
              Observações do Pedido (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              disabled={enviando}
              placeholder="Alguma observação sobre o pedido? Ex: Sem cebola, ponto da carne, etc."
              className="w-full p-3 border border-[#400b0b]/20 rounded-lg focus:ring-2 focus:ring-[#e58840] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-[#400b0b]"
            />
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-[#e58840]/5 rounded-xl p-4 border border-[#400b0b]/10">
            <h3 className="font-bold text-[#400b0b] mb-3">Resumo Financeiro</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#400b0b]">
                <span>Subtotal ({totalItens} itens):</span>
                <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              
              {/* Cupom de desconto */}
              {cupomAplicado && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto cupom ({cupomValido?.codigo}):</span>
                  <span>- R$ {cupomValido?.valor_calculado?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              
              {cupomAplicado && (
                <div className="flex justify-between text-sm text-[#400b0b]">
                  <span>Subtotal com desconto:</span>
                  <span>{subtotalComDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              )}
              
              {tipoEntrega === 'delivery' && (
                <div className="flex justify-between text-sm text-[#400b0b]">
                  <span>Taxa de entrega:</span>
                  <span>R$ {taxaEntrega.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#400b0b]/10 text-[#400b0b]">
                <span>Total:</span>
                <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#400b0b]/10">
          <button
            onClick={() => {
              if (tipoEntrega === 'local') {
                setMostrarModalConfirmacao(true);
              } else {
                handleFinalizarOutrosTipos();
              }
            }}
            disabled={
              enviando ||
              (tipoEntrega !== 'local' && (!nome || !telefone || 
                (tipoEntrega === 'delivery' && (!cepValido || !endereco || !numero || !bairro || !cidade))))
            }
            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
              (tipoEntrega === 'local') ||
              (nome && telefone && (tipoEntrega !== 'delivery' || (cepValido && endereco && numero && bairro && cidade)))
                ? 'bg-[#e58840] text-[#400b0b] hover:bg-[#e58840]/90 shadow-sm hover:shadow-md active:scale-[0.98] disabled:bg-gray-300 disabled:text-[#400b0b]/40 disabled:cursor-not-allowed'
                : 'bg-gray-200 text-[#400b0b]/40 cursor-not-allowed'
            }`}
          >
            {enviando ? (
              <>
                <svg className="animate-spin h-5 w-5 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </>
            ) : (
              tipoEntrega === 'local' ? 'Continuar para Confirmação' : 'Finalizar Pedido'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCheckout;