import React, { useState } from 'react';
import { ItemCarrinho } from '../../types';

interface ModalEntregaProps {
  isOpen: boolean;
  onClose: () => void;
  itens: ItemCarrinho[];
  subtotal: number;
  onConfirmarTipoEntrega: (tipo: 'local' | 'retirada' | 'delivery', comandaNumero?: string) => void;
}

export const ModalEntrega: React.FC<ModalEntregaProps> = ({
  isOpen,
  onClose,
  itens,
  subtotal,
  onConfirmarTipoEntrega
}) => {
  const [tipoSelecionado, setTipoSelecionado] = useState<'local' | 'retirada' | 'delivery' | null>(null);

  // Função para formatar opções
  const formatarOpcoesItem = (item: ItemCarrinho): string[] => {
    const opcoesFormatadas: string[] = [];
    
    item.produto.opcoes?.forEach(grupo => {
      const opcaoId = item.opcoesSelecionadas[grupo.id];
      if (opcaoId) {
        const opcao = grupo.opcoes.find(o => o.id === opcaoId);
        if (opcao) {
          opcoesFormatadas.push(opcao.rotulo || opcao.nome || opcaoId);
        }
      }
    });
    
    return opcoesFormatadas;
  };

  const handleConfirmar = () => {
    if (tipoSelecionado) {
      onConfirmarTipoEntrega(tipoSelecionado);
    }
  };

  if (!isOpen) return null;

  const totalItens = itens.reduce((total, item) => total + item.quantidade, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#e58840] text-[#400b0b] p-4 text-center relative">
          <h2 className="text-xl font-bold">Como vai ser hoje?</h2>
          <p className="text-secondary-200 text-sm">Escolha como deseja receber seu pedido</p>
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Resumo do Pedido */}
        <div className="p-4 border-b">
          <h3 className="font-bold text-primary-900 mb-2">Seu Pedido</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {itens.map((item, index) => {
              const opcoesFormatadas = formatarOpcoesItem(item);
              const precoUnitario = (item.precoTotal / item.quantidade);
              
              return (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <span className="text-primary-600">
                      {item.quantidade}x {item.produto.nome}
                    </span>
                    {opcoesFormatadas.length > 0 && (
                      <div className="text-xs text-primary-500 mt-1">
                        {opcoesFormatadas.map((opcao, i) => (
                          <div key={i}>• {opcao}</div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-primary-400">
                      {precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} cada
                    </div>
                  </div>
                  <span className="font-medium whitespace-nowrap">
                    {item.precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t mt-3">
            <span>Total ({totalItens} itens):</span>
            <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>

        {/* Opções de Entrega */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Consumo no Local */}
            <button
              onClick={() => setTipoSelecionado('local')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                tipoSelecionado === 'local'
                  ? 'border-primary-900 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                  tipoSelecionado === 'local'
                    ? 'border-primary-900 bg-primary-900'
                    : 'border-gray-300'
                }`}>
                  {tipoSelecionado === 'local' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-primary-900">Consumo no Local</h4>
                  <p className="text-sm text-primary-600 mt-1">Vou consumir aqui mesmo</p>
                  <p className="text-xs text-primary-500 mt-2">
                    <span className="font-medium">Pronto em 15-20 minutos • Entregue na sua mesa</span>
                  </p>
                </div>
                <div className="text-2xl ml-2">🍽️</div>
              </div>
            </button>

            {/* Retirada no Local */}
            <button
              onClick={() => setTipoSelecionado('retirada')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                tipoSelecionado === 'retirada'
                  ? 'border-primary-900 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                  tipoSelecionado === 'retirada'
                    ? 'border-primary-900 bg-primary-900'
                    : 'border-gray-300'
                }`}>
                  {tipoSelecionado === 'retirada' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-primary-900">Retirada no Local</h4>
                  <p className="text-sm text-primary-600 mt-1">Vou retirar no balcão</p>
                  <p className="text-xs text-primary-500 mt-2">
                    <span className="font-medium">Pronto em 10-15 minutos • Avisaremos por WhatsApp</span>
                  </p>
                </div>
                <div className="text-2xl ml-2">🚶</div>
              </div>
            </button>

            {/* Delivery */}
            <button
              onClick={() => setTipoSelecionado('delivery')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                tipoSelecionado === 'delivery'
                  ? 'border-primary-900 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                  tipoSelecionado === 'delivery'
                    ? 'border-primary-900 bg-primary-900'
                    : 'border-gray-300'
                }`}>
                  {tipoSelecionado === 'delivery' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-primary-900">Delivery</h4>
                  <p className="text-sm text-primary-600 mt-1">Quero receber em casa</p>
                  <p className="text-xs text-primary-500 mt-2">
                    <span className="font-medium">Taxa de entrega: R$ 5,00 • 30-40 minutos</span>
                  </p>
                </div>
                <div className="text-2xl ml-2">🚚</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleConfirmar}
            disabled={!tipoSelecionado}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
              tipoSelecionado
                ? 'bg-primary-900 text-white hover:bg-primary-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {tipoSelecionado === 'local' ? 'Escolher Comanda' : 'Continuar para Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEntrega;