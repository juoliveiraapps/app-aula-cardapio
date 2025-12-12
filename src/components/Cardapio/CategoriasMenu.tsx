import React, { useRef } from 'react';

interface Categoria {
  categoria_id: string;
  nome: string;
  icone_url?: string; // URL da imagem do ícone
  icone_svg?: string; // Ou SVG path direto
}

interface CategoriasMenuProps {
  categorias: Categoria[];
  categoriaAtiva: string | null;
  onCategoriaChange: (categoriaId: string | null) => void;
}

export const CategoriasMenu: React.FC<CategoriasMenuProps> = ({ 
  categorias, 
  categoriaAtiva, 
  onCategoriaChange 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Ícone padrão para quando não há ícone definido
  const IconePadrao = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  return (
    <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Botão Voltar */}
          <button
            onClick={scrollLeft}
            className="hidden md:flex flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-200 rounded-xl md:rounded-2xl items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md group"
            aria-label="Voltar categorias"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Container das Categorias */}
          <div ref={scrollContainerRef} className="flex-1 flex space-x-2 md:space-x-3 overflow-x-auto scrollbar-hide">
            {/* Botão Todos */}
            <button
              onClick={() => onCategoriaChange(null)}
              className={`flex-shrink-0 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base font-medium transition-all duration-300 flex items-center space-x-1.5 md:space-x-2 ${
                categoriaAtiva === null
                  ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/25'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
              }`}
            >
              <svg className={`w-4 h-4 md:w-5 md:h-5 ${categoriaAtiva === null ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Todos</span>
            </button>

            {/* Categorias com Ícones Dinâmicos */}
            {categorias.map(categoria => (
              <button
                key={categoria.categoria_id}
                onClick={() => onCategoriaChange(categoria.categoria_id)}
                className={`flex-shrink-0 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base font-medium transition-all duration-300 flex items-center space-x-1.5 md:space-x-2 ${
                  categoriaAtiva === categoria.categoria_id
                    ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/25'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Ícone Dinâmico - Prioridade para icone_url, depois icone_svg, depois padrão */}
                {categoria.icone_url ? (
                  // Se tem URL de imagem
                  <img
                    src={categoria.icone_url}
                    alt={categoria.nome}
                    className={`w-4 h-4 md:w-5 md:h-5 object-contain ${
                      categoriaAtiva === categoria.categoria_id
                        ? 'filter brightness-0 invert'
                        : 'opacity-70'
                    }`}
                    onError={(e) => {
                      // Fallback se a imagem não carregar
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : categoria.icone_svg ? (
                  // Se tem SVG path direto
                  <svg className={`w-4 h-4 md:w-5 md:h-5 ${categoriaAtiva === categoria.categoria_id ? 'text-white' : 'text-gray-400'}`}
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoria.icone_svg} />
                  </svg>
                ) : (
                  // Ícone padrão
                  <IconePadrao className={`w-4 h-4 md:w-5 md:h-5 ${categoriaAtiva === categoria.categoria_id ? 'text-white' : 'text-gray-400'}`} />
                )}
                <span>{categoria.nome}</span>
              </button>
            ))}
          </div>

          {/* Botão Avançar */}
          <button
            onClick={scrollRight}
            className="hidden md:flex flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-200 rounded-xl md:rounded-2xl items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md group"
            aria-label="Avançar categorias"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriasMenu;