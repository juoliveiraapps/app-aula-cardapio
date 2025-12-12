import type { Categoria } from '../../types';

interface FiltrosCategoriasProps {
  categorias: Categoria[];
  categoriaSelecionada: string | null;
  onCategoriaChange: (categoriaId: string | null) => void;
}

export function FiltrosCategorias({
  categorias,
  categoriaSelecionada,
  onCategoriaChange,
}: FiltrosCategoriasProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onCategoriaChange(null)}
        className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
          categoriaSelecionada === null
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
            : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'
        }`}
      >
        Todos
      </button>

      {categorias.map((categoria) => (
        <button
          key={categoria.categoria_id}
          onClick={() => onCategoriaChange(categoria.categoria_id)}
          className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
            categoriaSelecionada === categoria.categoria_id
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'
          }`}
        >
          {categoria.nome}
        </button>
      ))}
    </div>
  );
}
