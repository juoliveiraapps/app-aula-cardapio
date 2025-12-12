import React, { useState } from 'react';
import { Produto } from '../../types';

interface ModalOpcoesProps {
  produto: Produto;
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (opcoes: { [key: string]: string }, observacao: string, quantidade: number) => void; // ADICIONADO quantidade
}

export const ModalOpcoes: React.FC<ModalOpcoesProps> = ({ 
  produto, 
  isOpen, 
  onClose, 
  onConfirmar 
}) => {
  const [opcoesSelecionadas, setOpcoesSelecionadas] = useState<{ [key: string]: string }>({});
  const [observacao, setObservacao] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  if (!isOpen) return null;

  const precoBase = Number(produto.preco) || 0;

  const calcularPrecoTotal = () => {
    let total = precoBase;
    
    // Calcular acréscimos das opções
    Object.values(opcoesSelecionadas).forEach(opcaoId => {
      produto.opcoes?.forEach(grupo => {
        const opcao = grupo.opcoes.find(o => o.id === opcaoId);
        if (opcao) {
          const acrescimo = Number(opcao.acrescimo) || 0;
          total += acrescimo;
        }
      });
    });
    
    return total * quantidade;
  };

  const handleConfirmar = () => {
    const opcoesObrigatorias = produto.opcoes?.filter(g => g.obrigatorio) || [];
    const todasObrigatoriasPreenchidas = opcoesObrigatorias.every(
      grupo => opcoesSelecionadas[grupo.id]
    );

    if (!todasObrigatoriasPreenchidas) {
      alert('Por favor, selecione todas as opções obrigatórias');
      return;
    }

    onConfirmar(opcoesSelecionadas, observacao, quantidade); // AGORA PASSA A QUANTIDADE
    setOpcoesSelecionadas({});
    setObservacao('');
    setQuantidade(1);
  };

  const aumentarQuantidade = () => {
    setQuantidade(prev => prev + 1);
  };

  const diminuirQuantidade = () => {
    if (quantidade > 1) {
      setQuantidade(prev => prev - 1);
    }
  };

  const precoTotal = calcularPrecoTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl md:rounded-2xl max-w-md w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          {produto.imagem_url && (
            <img
              src={produto.imagem_url}
              alt={produto.nome}
              className="w-full h-24 md:h-32 object-cover"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-3 md:p-4 overflow-y-auto max-h-60">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{produto.nome}</h3>
          
          <div className="flex justify-between items-center mb-3 md:mb-4">
            {produto.descricao && (
              <p className="text-gray-600 text-xs md:text-sm">{produto.descricao}</p>
            )}
            <span className="text-base md:text-lg font-bold text-primary-900">
              {precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          {/* Opções */}
          {produto.opcoes?.map(grupo => (
            <div key={grupo.id} className="mb-3 md:mb-4">
              <h4 className="font-semibold text-gray-900 text-xs md:text-sm mb-2">
                {grupo.rotulo}
                {grupo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
              </h4>
              <div className="space-y-1">
                {grupo.opcoes.map(opcao => (
                  <label key={opcao.id} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-xs md:text-sm">
                    <input
                      type="radio"
                      name={grupo.id}
                      value={opcao.id}
                      checked={opcoesSelecionadas[grupo.id] === opcao.id}
                      onChange={(e) => setOpcoesSelecionadas(prev => ({
                        ...prev,
                        [grupo.id]: e.target.value
                      }))}
                      className="text-primary-900 focus:ring-primary-500"
                    />
                    <span className="ml-2 flex-1">{opcao.rotulo}</span>
                    {opcao.acrescimo > 0 && (
                      <span className="text-primary-900 font-semibold text-[10px] md:text-xs">
                        + {(Number(opcao.acrescimo) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Quantidade */}
          <div className="mb-3 md:mb-4">
            <h4 className="font-semibold text-gray-900 text-xs md:text-sm mb-2">Quantidade</h4>
            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={diminuirQuantidade}
                disabled={quantidade <= 1}
                className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                -
              </button>
              <span className="font-bold text-base md:text-lg w-8 text-center">{quantidade}</span>
              <button
                onClick={aumentarQuantidade}
                className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Observações */}
          <div className="mb-3 md:mb-4">
            <h4 className="font-semibold text-gray-900 text-xs md:text-sm mb-2">Observações</h4>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Alguma observação especial? (opcional)"
              className="w-full p-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs md:text-sm"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div>
              <span className="text-xs md:text-sm font-bold text-gray-900">Subtotal:</span>
              <span className="text-base md:text-lg font-bold text-primary-900 ml-2">
                {precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
          <button
            onClick={handleConfirmar}
            className="w-full bg-primary-900 text-white py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-primary-800 transition-all duration-300"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalOpcoes;