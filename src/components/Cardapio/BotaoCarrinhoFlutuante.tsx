import React from 'react';

interface BotaoCarrinhoFlutuanteProps {
  totalItens: number;
  subtotal: number;
  onClick: () => void;
}

export const BotaoCarrinhoFlutuante: React.FC<BotaoCarrinhoFlutuanteProps> = ({
  totalItens,
  subtotal,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-green-600 text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 z-40 flex items-center space-x-2 md:space-x-3"
    >
      <div className="relative">
        {/* Ícone profissional */}
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>

        {totalItens > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] md:text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center font-bold">
            {totalItens}
          </span>
        )}
      </div>

      <div className="text-left">
        <div className="font-bold text-sm md:text-lg">
          {subtotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
        <div className="text-[10px] md:text-xs opacity-90">
          {'Ver carrinho'}
        </div>
      </div>
    </button>
  );
};

export default BotaoCarrinhoFlutuante;