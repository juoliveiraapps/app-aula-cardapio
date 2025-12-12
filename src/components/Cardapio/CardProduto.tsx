import { Plus } from 'lucide-react';
import type { Produto } from '../../types';

interface CardProdutoProps {
  produto: Produto;
  onAdicionar: (produto: Produto) => void;
}

export function CardProduto({ produto, onAdicionar }: CardProdutoProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={produto.imagem_url || 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Produto'}
          alt={produto.nome}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{produto.nome}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{produto.descricao}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">
            R$ {produto.preco.toFixed(2)}
          </span>

          <button
            onClick={() => onAdicionar(produto)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
