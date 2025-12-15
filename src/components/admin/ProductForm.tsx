import React, { useState } from 'react';

interface ProductFormProps {
  onSuccess?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de envio
    setTimeout(() => {
      alert('Produto cadastrado com sucesso!');
      setLoading(false);
      onSuccess?.();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Nome do Produto *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
            placeholder="Ex: Cappuccino Especial"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Preço (R$) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
            placeholder="Ex: 12.90"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Descrição
        </label>
        <textarea
          rows={3}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
          placeholder="Descreva o produto..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Categoria
        </label>
        <select className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#e58840] focus:border-transparent">
          <option value="">Selecione uma categoria</option>
          <option value="cafe">Cafés</option>
          <option value="bolo">Bolos</option>
          <option value="suco">Sucos</option>
          <option value="sanduiche">Sanduíches</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Posição no Cardápio
        </label>
        <input
          type="number"
          min="1"
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
          placeholder="Número para ordenação (opcional)"
        />
      </div>

      <div className="pt-4 border-t border-gray-700">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Cadastrar Produto'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm; // ← Exportação DEFAULT