import React, { useState, useEffect } from 'react';
import { ItemCarrinho } from '../../types';

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
  }) => Promise<void>;
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

  const subtotal = itens.reduce((total, item) => total + item.precoTotal, 0);
  const taxaEntrega = tipoEntrega === 'delivery' ? 5 : 0;
  const total = subtotal + taxaEntrega;
  const totalItens = itens.reduce((total, item) => total + item.quantidade, 0);

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
        } else {
          setCepValido(false);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setCepValido(false);
      } finally {
        setBuscandoCep(false);
      }
    } else {
      setCepValido(false);
    }
  };

  // Efeito para buscar CEP quando terminar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cep.length === 8) {
        buscarCep();
      } else {
        setCepValido(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [cep]);

  // Resetar campos quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      if (tipoEntrega === 'local' && comandaNumero) {
        // Para consumo local, já mostra modal de confirmação
        setMostrarModalConfirmacao(true);
      } else {
        // Para retirada e delivery, resetar estados
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

  // Função para confirmar pedido (consumo local)
  const handleConfirmarPedidoLocal = async () => {
    await onFinalizarPedido({
      observacoes,
      formaPagamento: 'local',
      comanda: comandaNumero,
      querWhatsApp: false // Consumo local não envia WhatsApp
    });
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

    await onFinalizarPedido({
      nome,
      telefone,
      ...(tipoEntrega === 'delivery' && {
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        referencia
      }),
      observacoes,
      formaPagamento,
      querWhatsApp
    });
  };

  // Modal de confirmação para consumo no local
  if (mostrarModalConfirmacao && tipoEntrega === 'local') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-primary-900 text-white p-6 text-center">
            <h2 className="text-2xl font-bold">Confirmar Pedido</h2>
            <p className="text-secondary-200 mt-1">
              Comanda #{comandaNumero}
            </p>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary-900 mb-2">
                Confirmar pedido para Comanda #{comandaNumero}?
              </h3>
              <p className="text-primary-600 mb-4">
                Seu pedido será enviado para a cozinha e servido na sua mesa.
              </p>

              {/* Resumo do Pedido */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <h4 className="font-bold text-primary-900 mb-3">Resumo do Pedido</h4>
                <div className="space-y-3">
                  {itens.map((item, index) => {
                    const opcoesFormatadas = formatarOpcoesItem(item);
                    return (
                      <div key={index} className="flex justify-between">
                        <div>
                          <span className="text-sm font-medium">{item.quantidade}x {item.produto.nome}</span>
                          {opcoesFormatadas && (
                            <p className="text-xs text-primary-600 mt-1">{opcoesFormatadas}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {item.precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações (opcional) */}
              <div className="mb-6 text-left">
                <label className="block text-sm font-medium text-primary-900 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Alguma observação sobre o pedido?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => setMostrarModalConfirmacao(false)}
              className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={enviando}
            >
              Voltar
            </button>
            <button
              onClick={handleConfirmarPedidoLocal}
              disabled={enviando}
              className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                enviando
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-900 text-white hover:bg-primary-800'
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
        {/* Header */}
        <div className="bg-primary-900 text-white p-4 text-center relative">
          <h2 className="text-xl font-bold">Finalizar Pedido</h2>
          <p className="text-secondary-200 text-sm">
            {tipoEntrega === 'local' ? 'Consumo no Local' : 
             tipoEntrega === 'retirada' ? 'Retirada no Local' : 'Delivery'}
          </p>
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            disabled={enviando}
          >
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* INFO DO TIPO DE ENTREGA */}
          <div className="mb-6">
            <div className={`p-4 rounded-xl border-2 ${
              tipoEntrega === 'local' 
                ? 'border-blue-200 bg-blue-50' 
                : tipoEntrega === 'retirada'
                ? 'border-green-200 bg-green-50'
                : 'border-purple-200 bg-purple-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  tipoEntrega === 'local' 
                    ? 'bg-blue-100 text-blue-600' 
                    : tipoEntrega === 'retirada'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-purple-100 text-purple-600'
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
                  <h3 className="font-bold text-primary-900">
                    {tipoEntrega === 'local' ? 'Consumo no Local' : 
                     tipoEntrega === 'retirada' ? 'Retirada no Local' : 'Delivery'}
                  </h3>
                  <p className="text-sm text-primary-600 mt-1">
                    {tipoEntrega === 'local' 
                      ? 'Seu pedido será entregue à sua mesa'
                      : tipoEntrega === 'retirada'
                      ? 'Retire seu pedido no balcão'
                      : 'Entregaremos no seu endereço'}
                  </p>
                  
                  {/* Mostrar número da comanda se for consumo local */}
                  {tipoEntrega === 'local' && comandaNumero && (
                    <div className="mt-2 flex items-center">
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        Comanda #{comandaNumero}
                      </span>
                    </div>
                  )}
                  
                  {/* Mostrar tempo estimado */}
                  <p className="text-xs text-primary-500 mt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tipoEntrega === 'local' 
                      ? 'Pronto em 15-20 minutos'
                      : tipoEntrega === 'retirada'
                      ? 'Pronto em 10-15 minutos'
                      : `30-40 minutos • Taxa de entrega: R$ 5,00`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="mb-6 bg-primary-50 rounded-xl p-4">
            <h3 className="font-bold text-primary-900 mb-3">Resumo do Pedido</h3>
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
                      <p className="font-medium text-sm">
                        {item.quantidade}x {item.produto.nome}
                      </p>
                      {opcoesFormatadas && (
                        <p className="text-xs text-primary-600 mt-1">
                          {opcoesFormatadas}
                        </p>
                      )}
                      <p className="text-xs text-primary-500 mt-1">
                        {precoUnitario} cada
                      </p>
                      {item.observacao && (
                        <p className="text-xs text-primary-400 italic mt-1">
                          Obs: {item.observacao}
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-sm whitespace-nowrap">
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
                <h3 className="font-bold text-primary-900 mb-3">Seus Dados</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      disabled={enviando}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-1">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                      disabled={enviando}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço para Delivery */}
              {tipoEntrega === 'delivery' && (
                <div className="mb-6">
                  <h3 className="font-bold text-primary-900 mb-3">Endereço de Entrega</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
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
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button
                          onClick={buscarCep}
                          disabled={cep.length !== 8 || buscandoCep || enviando}
                          className="bg-primary-600 text-white px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {buscandoCep ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : 'Buscar'}
                        </button>
                      </div>
                      {buscandoCep && <p className="text-xs text-primary-600 mt-1">Buscando endereço...</p>}
                    </div>

                    {/* Campos de endereço só aparecem após CEP válido */}
                    {cepValido && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-primary-900 mb-1">
                            Endereço *
                          </label>
                          <input
                            type="text"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                            required
                            disabled={enviando}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Rua, Avenida, etc."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-primary-900 mb-1">
                              Número *
                            </label>
                            <input
                              type="text"
                              value={numero}
                              onChange={(e) => setNumero(e.target.value)}
                              required
                              disabled={enviando}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="123"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-primary-900 mb-1">
                              Complemento
                            </label>
                            <input
                              type="text"
                              value={complemento}
                              onChange={(e) => setComplemento(e.target.value)}
                              disabled={enviando}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="Apto, Bloco, etc."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-900 mb-1">
                            Bairro *
                          </label>
                          <input
                            type="text"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            required
                            disabled={enviando}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-900 mb-1">
                            Cidade *
                          </label>
                          <input
                            type="text"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            required
                            disabled={enviando}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-900 mb-1">
                            Ponto de Referência
                          </label>
                          <textarea
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            rows={2}
                            disabled={enviando}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                <h3 className="font-bold text-primary-900 mb-3">Forma de Pagamento</h3>
                <div className="space-y-2">
                  {['dinheiro', 'cartao', 'pix'].map((forma) => (
                    <label key={forma} className={`flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer ${enviando ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="radio"
                        name="formaPagamento"
                        value={forma}
                        checked={formaPagamento === forma}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                        disabled={enviando}
                        className="text-primary-900 focus:ring-primary-500"
                      />
                      <span className="ml-3 font-medium">
                        {forma === 'dinheiro' ? 'Dinheiro' : 
                         forma === 'cartao' ? 'Cartão na entrega/retirada' : 
                         'PIX'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Opção WhatsApp (apenas para retirada e delivery) */}
              {(tipoEntrega === 'retirada' || tipoEntrega === 'delivery') && (
                <div className="mb-6">
                  <h3 className="font-bold text-primary-900 mb-3">Confirmação por WhatsApp</h3>
                  <label className={`flex items-start p-4 rounded-lg cursor-pointer transition-all ${
                    querWhatsApp
                      ? 'bg-green-50 border-2 border-green-500'
                      : 'bg-gray-50 border-2 border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={querWhatsApp}
                      onChange={(e) => setQuerWhatsApp(e.target.checked)}
                      disabled={enviando}
                      className="mt-1 text-green-600 focus:ring-green-500 w-5 h-5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        <span className="font-bold text-primary-900">
                          Enviar confirmação pelo WhatsApp
                        </span>
                        {querWhatsApp && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-primary-600 mt-1">
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
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Observações do Pedido (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              disabled={enviando}
              placeholder="Alguma observação sobre o pedido? Ex: Sem cebola, ponto da carne, etc."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-primary-900 mb-3">Resumo Financeiro</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totalItens} itens):</span>
                <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              
              {tipoEntrega === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega:</span>
                  <span>R$ 5,00</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (tipoEntrega === 'local') {
                // Para consumo local, mostra modal de confirmação
                setMostrarModalConfirmacao(true);
              } else {
                // Para retirada e delivery, finalizar
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
                ? 'bg-primary-900 text-white hover:bg-primary-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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