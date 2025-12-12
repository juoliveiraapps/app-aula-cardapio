import React from 'react';
import { ItemCarrinho } from '../../types';

interface CarrinhoProps {
  itens: ItemCarrinho[];
  isOpen: boolean;
  onClose: () => void;
  onAtualizarQuantidade: (index: number, quantidade: number) => void;
  onRemoverItem: (index: number) => void;
  onLimparCarrinho: () => void;
  onIniciarCheckout: () => void;
  pedidoMinimo: number;
}

export const Carrinho: React.FC<CarrinhoProps> = ({ 
  itens, 
  isOpen, 
  onClose, 
  onAtualizarQuantidade, 
  onRemoverItem, 
  onLimparCarrinho,
  onIniciarCheckout,
  pedidoMinimo 
}) => {
  const subtotal = itens.reduce((total, item) => total + item.precoTotal, 0);
  const totalItens = itens.reduce((total, item) => total + item.quantidade, 0);

  // FUNÇÃO PARA FORMATAR OPÇÕES - CORRIGIDA
  const formatarOpcoes = (item: ItemCarrinho): string[] => {
    const opcoesFormatadas: string[] = [];
    
    // Para cada grupo de opções do produto
    item.produto.opcoes?.forEach(grupo => {
      const opcaoId = item.opcoesSelecionadas[grupo.id];
      if (opcaoId) {
        const opcao = grupo.opcoes.find(o => o.id === opcaoId);
        if (opcao) {
          // Usa rotulo em vez de id
          opcoesFormatadas.push(opcao.rotulo);
        }
      }
    });
    
    return opcoesFormatadas;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl md:rounded-2xl max-w-md w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary-900 text-white p-3 md:p-4 text-center relative">
          <h2 className="text-lg md:text-xl font-bold">Seu Carrinho</h2>
          <p className="text-secondary-200 text-xs md:text-sm">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</p>
          <button
            onClick={onClose}
            className="absolute top-2 md:top-3 right-3 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          {itens.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">🛒</div>
              <h3 className="text-base md:text-lg font-bold text-primary-600 mb-1 md:mb-2">Carrinho vazio</h3>
              <p className="text-primary-500 text-xs md:text-sm">Adicione alguns itens deliciosos!</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {/* Botão Limpar Carrinho */}
              <div className="mb-2">
                <button
                  onClick={onLimparCarrinho}
                  className="flex items-center justify-center w-full py-2 text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpar Carrinho
                </button>
              </div>

              {/* Lista de Itens */}
              {itens.map((item, index) => {
                const opcoesFormatadas = formatarOpcoes(item);
                const precoUnitario = (item.precoTotal / item.quantidade);
                
                return (
                  <div key={index} className="bg-primary-50 rounded-lg md:rounded-xl p-2 md:p-3 border border-primary-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-primary-900 text-xs md:text-sm">{item.produto.nome}</h4>
                        
                        {/* Preço unitário formatado */}
                        <p className="text-primary-600 text-[10px] md:text-xs mt-1">
                          {precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} cada
                        </p>
                        
                        {/* Opções formatadas - MOSTRA RÓTULOS */}
                        {opcoesFormatadas.length > 0 && (
                          <div className="mt-1">
                            <p className="text-primary-600 text-[10px] md:text-xs font-medium">Opções:</p>
                            <p className="text-primary-500 text-[10px] md:text-xs">
                              {opcoesFormatadas.join(', ')}
                            </p>
                          </div>
                        )}
                        
                        {item.observacao && (
                          <p className="text-primary-500 text-[10px] md:text-xs mt-1">Obs: {item.observacao}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoverItem(index)}
                        className="text-red-500 hover:text-red-700 p-1 text-xs md:text-sm"
                        title="Remover item"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onAtualizarQuantidade(index, item.quantidade - 1)}
                          className="w-5 h-5 md:w-6 md:h-6 bg-primary-200 rounded-full flex items-center justify-center hover:bg-primary-300 transition-colors text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold w-5 md:w-6 text-center text-xs md:text-sm">{item.quantidade}</span>
                        <button
                          onClick={() => onAtualizarQuantidade(index, item.quantidade + 1)}
                          className="w-5 h-5 md:w-6 md:h-6 bg-primary-200 rounded-full flex items-center justify-center hover:bg-primary-300 transition-colors text-xs"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary-900 text-xs md:text-sm">
                          {item.precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <p className="text-primary-500 text-[10px] md:text-xs">
                          {item.quantidade} × {precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - CORRIGIDO PARA SEMPRE MOSTRAR "CONTINUAR" */}
        {itens.length > 0 && (
          <div className="p-3 md:p-4 border-t border-primary-200 bg-white">
            <div className="space-y-2 mb-3 md:mb-4">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-primary-600">Subtotal ({totalItens} itens):</span>
                <span className="font-bold">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>

              {/* REMOVA A VERIFICAÇÃO DE PEDIDO MÍNIMO */}
              {/* {subtotal < pedidoMinimo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg md:rounded-xl p-2">
                  <p className="text-yellow-800 text-[10px] md:text-xs text-center">
                    ⚠️ Pedido mínimo: {pedidoMinimo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              )} */}
            </div>

            {/* BOTÃO SEMPRE ATIVO E COM TEXTO "CONTINUAR" */}
            <button
              onClick={onIniciarCheckout}
              className="w-full bg-[#e58840] text-[#400b0b] py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-[#e58840]/90 active:scale-[0.98] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Carrinho;