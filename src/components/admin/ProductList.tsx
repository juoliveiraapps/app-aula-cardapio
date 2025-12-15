import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de carregamento
    setTimeout(() => {
      setProducts([
        { id: '1', nome: 'Cappuccino', preco: 12.90, categoria: 'Cafés', disponivel: true },
        { id: '2', nome: 'Bolo de Cenoura', preco: 8.50, categoria: 'Bolos', disponivel: true },
        { id: '3', nome: 'Suco de Laranja', preco: 7.00, categoria: 'Sucos', disponivel: true },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e58840]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Produto</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Preço</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Categoria</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium text-white">{product.nome}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-300">R$ {product.preco.toFixed(2)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                    {product.categoria}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.disponivel
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {product.disponivel ? 'Disponível' : 'Indisponível'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      Editar
                    </button>
                    <button className="text-red-400 hover:text-red-300 text-sm">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList; // ← Exportação DEFAULT