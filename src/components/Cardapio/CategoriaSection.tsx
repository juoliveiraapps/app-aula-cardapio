import React from 'react';
import { Categoria, Produto } from '../../types';
import ProdutoCard from './ProdutoCard';

interface CategoriaSectionProps {
  categoria: Categoria;
  produtos: Produto[];
  onAdicionarAoCarrinho: (produto: Produto, opcoes: { [key: string]: string }, observacao: string, quantidade: number) => void; // CORREÇÃO: adiciona quantidade
}

export const CategoriaSection: React.FC<CategoriaSectionProps> = ({
  categoria,
  produtos,
  onAdicionarAoCarrinho
}) => {
  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      {/* Header da Categoria */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 md:p-4">
        <h2 className="text-base md:text-xl font-bold text-primary-900">{categoria.nome}</h2>
        {categoria.descricao && (
          <p className="text-gray-600 text-xs md:text-sm mt-1">{categoria.descricao}</p>
        )}
      </div>

      {/* Produtos - 2 Colunas */}
      <div className="p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {produtos.map(produto => (
            <ProdutoCard
              key={produto.produto_id}
              produto={produto}
              onAdicionar={onAdicionarAoCarrinho}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriaSection;