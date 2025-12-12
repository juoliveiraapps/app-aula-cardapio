import React from 'react';

interface BarraBuscaProps {
  termoBusca: string;
  onBuscaChange: (termo: string) => void;
  label?: string;
  placeholder?: string;
}

export const BarraBusca: React.FC<BarraBuscaProps> = ({ 
  termoBusca, 
  onBuscaChange,
  label,
  placeholder = "Buscar produtos..." 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative max-w-2xl mx-auto">
        <div className={`
          flex items-center overflow-hidden rounded-lg md:rounded-xl border border-gray-300 bg-white px-3 py-2 md:px-4 md:py-3 text-sm
          ring-offset-background transition-all duration-200
          focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2
          hover:border-gray-400
        `}>
          {/* Ícone de busca */}
          <div className="text-gray-400 mr-2 md:mr-3">
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder={placeholder}
            value={termoBusca}
            onChange={(e) => onBuscaChange(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-sm md:text-base"
          />

          {/* Botão de limpar */}
          {termoBusca && (
            <button
              onClick={() => onBuscaChange('')}
              className="ml-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarraBusca;