import React from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface Category {
  id: string;
  nome: string;
  descricao: string;
  posicao: number;
  visivel: boolean;
  icone_svg: string;
}

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
  emptyMessage?: string;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = 'Nenhuma categoria cadastrada'
}) => {
  // Função corrigida para renderizar SVG path corretamente
  const renderIconSVG = (svgPath: string, size: number = 24) => {
    // Dividir por comandos SVG (M, L, C, Q, etc.)
    const commands = svgPath.split(/(?=[A-Z])/).filter(cmd => cmd.trim());
    
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-300"
      >
        {commands.map((command, index) => {
          // Remover espaços em branco extras
          const cleanCommand = command.trim();
          return <path key={index} d={cleanCommand} />;
        })}
      </svg>
    );
  };

  // Se não há categorias
  if (!loading && categories.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <div className="text-4xl mb-4">📁</div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500">
          Comece criando sua primeira categoria para organizar o cardápio.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-700/50 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700/50 rounded w-32"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-24"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-700/50 rounded w-16"></div>
                    <div className="h-6 bg-gray-700/50 rounded w-12"></div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <div className="w-8 h-8 bg-gray-700/50 rounded"></div>
                <div className="w-8 h-8 bg-gray-700/50 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className={`bg-gray-800/50 rounded-xl border p-4 hover:border-[#e58840]/30 transition-all duration-300 ${
            !category.visivel 
              ? 'opacity-70 border-gray-700/50' 
              : 'border-gray-700/50 hover:shadow-lg hover:shadow-[#e58840]/5'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {/* Ícone SVG */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                category.visivel 
                  ? 'bg-gray-900/70 border-gray-700/50' 
                  : 'bg-gray-900/50 border-gray-800/50'
              }`}>
                <div className="w-8 h-8 flex items-center justify-center">
                  {category.icone_svg && category.icone_svg.trim() ? (
                    renderIconSVG(category.icone_svg, 24)
                  ) : (
                    <div className="text-gray-500 text-xl">📦</div>
                  )}
                </div>
              </div>
              
              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-white truncate">
                    {category.nome}
                  </h4>
                  {!category.visivel && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-700/50 text-gray-400 rounded flex items-center">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Oculto
                    </span>
                  )}
                </div>
                
                {/* Descrição */}
                {category.descricao && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {category.descricao}
                  </p>
                )}
                
                {/* Metadados */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-900/50 rounded text-gray-400 flex items-center">
                    <span className="mr-1">#</span>
                    {category.posicao}
                  </span>
                  
                  <span className={`text-xs px-2 py-1 rounded flex items-center ${
                    category.visivel
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {category.visivel ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Visível
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Oculto
                      </>
                    )}
                  </span>
                  
                  {/* Preview do código SVG (hover para ver completo) */}
                  {category.icone_svg && (
                    <span 
                      className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded truncate max-w-[80px] cursor-help"
                      title={`SVG: ${category.icone_svg}`}
                    >
                      Ícone SVG
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={() => onEdit(category)}
                disabled={loading}
                className="p-1.5 text-gray-400 hover:text-[#e58840] transition-colors hover:bg-gray-700/50 rounded disabled:opacity-50"
                title="Editar categoria"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(category.id)}
                disabled={loading}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors hover:bg-gray-700/50 rounded disabled:opacity-50"
                title="Excluir categoria"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Status adicional */}
          <div className="mt-4 pt-3 border-t border-gray-700/30">
            <div className="flex items-center justify-between text-xs">
              <div className="text-gray-500 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  category.visivel ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                <span>
                  {category.visivel ? (
                    <span className="text-green-400">Visível para clientes</span>
                  ) : (
                    <span className="text-red-400">Oculto dos clientes</span>
                  )}
                </span>
              </div>
              <div className="text-gray-500">
                Ordem: <span className="text-gray-300 font-medium">{category.posicao}º</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;