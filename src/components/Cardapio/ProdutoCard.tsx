import React, { useState } from 'react';
import { Produto } from '../../types';
import ModalOpcoes from './ModalOpcoes';

interface ProdutoCardProps {
  produto: Produto;
  onAdicionar: (produto: Produto, opcoes: { [key: string]: string }, observacao: string, quantidade: number) => void;
}

export const ProdutoCard: React.FC<ProdutoCardProps> = ({ produto, onAdicionar }) => {
  const [modalAberto, setModalAberto] = useState(false);

  const handleAdicionarDireto = () => {
    onAdicionar(produto, {}, '', 1);
  };

  // ATUALIZE ESTA FUNÇÃO para aceitar 3 parâmetros
  const handleComOpcoes = (opcoes: { [key: string]: string }, observacao: string, quantidade: number) => {
    console.log('🛒 Adicionando ao carrinho via modal:', { opcoes, observacao, quantidade });
    onAdicionar(produto, opcoes, observacao, quantidade);
    setModalAberto(false);
  };

  const estaDisponivel = produto.disponivel === true || 
                        produto.disponivel === 'TRUE' || 
                        produto.disponivel === '1' ||
                        produto.disponivel === undefined;

  return (
    <>
      <div className={`bg-white rounded-lg border transition-all duration-300 overflow-hidden group ${
        estaDisponivel
          ? 'border-gray-200 hover:border-primary-300'
          : 'border-gray-300 opacity-80'
      }`}>

        <div className="flex h-24 md:h-28">
          {/* Imagem */}
          <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 relative overflow-hidden">
            <img
              src={produto.imagem_url || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop'}
              alt={produto.nome}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                estaDisponivel ? 'group-hover:scale-105' : ''
              }`}
            />
            {/* Badge de status */}
            <div className="absolute top-1 right-1">
              <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                estaDisponivel
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {estaDisponivel ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 p-2 md:p-3 flex flex-col justify-between">
            <div>
              <h3 className={`font-semibold text-xs md:text-sm leading-tight mb-1 ${
                estaDisponivel ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {produto.nome}
              </h3>
              {produto.descricao && (
                <p className={`text-[10px] md:text-xs line-clamp-2 mb-1 md:mb-2 ${
                  estaDisponivel ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {produto.descricao}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-sm md:text-lg font-bold ${
                estaDisponivel ? 'text-primary-900' : 'text-gray-400'
              }`}>
                {(Number(produto.preco) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              
              {/* BOTÃO - Lógica simplificada */}
              {estaDisponivel ? (
                <button
                  onClick={() => {
                    console.log('➕ Clicou em Add para:', produto.nome);
                    if (produto.opcoes && produto.opcoes.length > 0) {
                      console.log('📱 Abrindo modal de opções');
                      setModalAberto(true);
                    } else {
                      console.log('⚡ Adicionando direto (sem opções)');
                      handleAdicionarDireto();
                    }
                  }}
                  className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg font-medium transition-all duration-300 text-[10px] md:text-xs bg-primary-900 text-white hover:bg-primary-800 active:scale-95"
                >
                  {produto.opcoes && produto.opcoes.length > 0 ? 'Add' : 'Add'}
                </button>
              ) : (
                <button
                  disabled
                  className="px-2 py-1.5 md:px-3 md:py-2 rounded-lg font-medium text-[10px] md:text-xs bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Opções - Só abre se disponível */}
      {estaDisponivel && (
        <ModalOpcoes
          produto={produto}
          isOpen={modalAberto}
          onClose={() => {
            console.log('❌ Fechando modal');
            setModalAberto(false);
          }}
          onConfirmar={handleComOpcoes} // ← ESTÁ CORRETO AGORA
        />
      )}
    </>
  );
};

export default ProdutoCard;