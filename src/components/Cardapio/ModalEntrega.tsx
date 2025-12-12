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
        <div className="bg-[#e58840] text-[#400b0b] p-4 text-center relative shadow-md">
          <h2 className="text-xl font-bold">Como vai ser hoje?</h2>
          <p className="text-[#400b0b]/80 text-sm">Escolha como deseja receber seu pedido</p>
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-8 h-8 bg-white/30 text-[#400b0b] rounded-full flex items-center justify-center hover:bg-white/40 transition-all duration-300"
          >
            ✕
          </button>
        </div>

        {/* Resumo do Pedido */}
        <div className="p-4 border-b border-[#400b0b]/10">
          <h3 className="font-bold text-[#400b0b] mb-2">Seu Pedido</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {itens.map((item, index) => {
              const opcoesFormatadas = formatarOpcoesItem(item);
              const precoUnitario = (item.precoTotal / item.quantidade);
              
              return (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <span className="text-[#400b0b]">
                      {item.quantidade}x {item.produto.nome}
                    </span>
                    {opcoesFormatadas.length > 0 && (
                      <div className="text-xs text-[#400b0b]/60 mt-1">
                        {opcoesFormatadas.map((opcao, i) => (
                          <div key={i}>• {opcao}</div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-[#400b0b]/50">
                      {precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} cada
                    </div>
                  </div>
                  <span className="font-medium whitespace-nowrap text-[#400b0b]">
                    {item.precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-[#400b0b]/10 mt-3">
            <span className="text-[#400b0b]">Total ({totalItens} itens):</span>
            <span className="text-[#400b0b]">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
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
                  ? 'bg-[#e58840] text-[#400b0b] border-[#e58840] shadow-md transform scale-[1.02]'
                  : 'bg-white text-[#400b0b] border-[#400b0b]/20 hover:border-[#e58840]/50 hover:bg-[#e58840]/5'
              }`}
            >
              <div className="flex items-center">
                {/* Radio button personalizado */}
                <div className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                  tipoSelecionado === 'local'
                    ? 'border-[#400b0b] bg-[#400b0b]'
                    : 'border-[#400b0b]/40 bg-white'
                }`}>
                  {tipoSelecionado === 'local' && (
                    <div className="w-2 h-2 rounded-full bg-[#e58840]"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${tipoSelecionado === 'local' ? 'text-[#400b0b]' : 'text-[#400b0b]'}`}>
                    Consumo no Local
                  </h4>
                  <p className={`text-sm mt-1 ${tipoSelecionado === 'local' ? 'text-[#400b0b]/90' : 'text-[#400b0b]/70'}`}>
                    Vou consumir aqui mesmo
                  </p>
                  <p className={`text-xs mt-2 ${tipoSelecionado === 'local' ? 'text-[#400b0b]/80 font-medium' : 'text-[#400b0b]/60'}`}>
                    <span>Pronto em 15-20 minutos • Entregue na sua mesa</span>
                  </p>
                </div>
                <div className={`text-2xl ml-2 p-2 rounded-full ${
                  tipoSelecionado === 'local' ? 'bg-[#400b0b]' : 'bg-[#400b0b]/10'
                }`}>
                  🍽️
                </div>
              </div>
            </button>

            {/* Retirada no Local */}
            <button
              onClick={() => setTipoSelecionado('retirada')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                tipoSelecionado === 'retirada'
                  ? 'bg-[#e58840] text-[#400b0b] border-[#e58840] shadow-md transform scale-[1.02]'
                  : 'bg-white text-[#400b0b] border-[#400b0b]/20 hover:border-[#e58840]/50 hover:bg-[#e58840]/5'
              }`}
            >
              <div className="flex items-center">
                {/* Radio button personalizado */}
                <div className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                  tipoSelecionado === 'retirada'
                    ? 'border-[#400b0b] bg-[#400b0b]'
                    : 'border-[#400b0b]/40 bg-white'
                }`}>
                  {tipoSelecionado === 'retirada' && (
                    <div className="w-2 h-2 rounded-full bg-[#e58840]"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${tipoSelecionado === 'retirada' ? 'text-[#400b0b]' : 'text-[#400b0b]'}`}>
                    Retirada no Local
                  </h4>
                  <p className={`text-sm mt-1 ${tipoSelecionado === 'retirada' ? 'text-[#400b0b]/90' : 'text-[#400b0b]/70'}`}>
                    Vou retirar no balcão
                  </p>
                  <p className={`text-xs mt-2 ${tipoSelecionado === 'retirada' ? 'text-[#400b0b]/80 font-medium' : 'text-[#400b0b]/60'}`}>
                    <span>Pronto em 10-15 minutos • Avisaremos por WhatsApp</span>
                  </p>
                </div>
                <div className={`text-2xl ml-2 p-2 rounded-full ${
                  tipoSelecionado === 'retirada' ? 'bg-[#400b0b]' : 'bg-[#400b0b]/10'
                }`}>
                  🚶
                </div>
              </div>
            </button>

            {/* Delivery */}
            <button
              onClick={() => setTipoSelecionado('delivery')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                tipoSelecionado === 'delivery'
                  ? 'bg-[#e58840] text-[#400b0b] border-[#e58840] shadow-md transform scale-[1.02]'
                  : 'bg-white text-[#400b0b] border-[#400b0b]/20 hover:border-[#e58840]/50 hover:bg-[#e58840]/5'
              }`}
            >
              <div className="flex items-center">
                {/* Radio button personalizado */}
                <div className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                  tipoSelecionado === 'delivery'
                    ? 'border-[#400b0b] bg-[#400b0b]'
                    : 'border-[#400b0b]/40 bg-white'
                }`}>
                  {tipoSelecionado === 'delivery' && (
                    <div className="w-2 h-2 rounded-full bg-[#e58840]"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${tipoSelecionado === 'delivery' ? 'text-[#400b0b]' : 'text-[#400b0b]'}`}>
                    Delivery
                  </h4>
                  <p className={`text-sm mt-1 ${tipoSelecionado === 'delivery' ? 'text-[#400b0b]/90' : 'text-[#400b0b]/70'}`}>
                    Quero receber em casa
                  </p>
                  <p className={`text-xs mt-2 ${tipoSelecionado === 'delivery' ? 'text-[#400b0b]/80 font-medium' : 'text-[#400b0b]/60'}`}>
                    <span>Taxa de entrega: R$ 5,00 • 30-40 minutos</span>
                  </p>
                </div>
                <div className={`text-2xl ml-2 p-2 rounded-full ${
                  tipoSelecionado === 'delivery' ? 'bg-[#400b0b]' : 'bg-[#400b0b]/10'
                }`}>
                  🚚
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#400b0b]/10">
          <button
            onClick={handleConfirmar}
            disabled={!tipoSelecionado}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
              tipoSelecionado
                ? 'bg-[#e58840] text-[#400b0b] hover:bg-[#e58840]/90 shadow-sm hover:shadow-md active:scale-[0.98]'
                : 'bg-gray-200 text-[#400b0b]/40 cursor-not-allowed'
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