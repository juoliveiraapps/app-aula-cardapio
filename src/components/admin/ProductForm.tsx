// ProductFormMinimal.tsx
import React from 'react';
import { X } from 'lucide-react';

interface ProductFormMinimalProps {
  initialData?: any;
  categorias: any[];
  onSubmit: (data: any) => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
}

const ProductFormMinimal: React.FC<ProductFormMinimalProps> = ({
  onClose,
  loading = false
}) => {
  console.log('✅ ProductFormMinimal RENDERIZADO!');

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Container centralizado */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Modal - Ocupa altura máxima disponível */}
        <div className="relative bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden z-[10000]">
          {/* Cabeçalho fixo */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Novo Produto - MINIMAL</h3>
                <p className="text-gray-400 text-sm">Modal funcional de teste</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Conteúdo rolável */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="space-y-4">
              <p className="text-gray-300">
                Se você vê isso, o modal funciona! O problema está no ProductForm original.
              </p>
              
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Problemas comuns:</p>
                <ul className="text-sm text-gray-300 mt-2 space-y-1">
                  <li>• Importação incorreta do ImageUploader</li>
                  <li>• Erro no TypeScript</li>
                  <li>• Estilos conflitantes</li>
                  <li>• Componente quebrado</li>
                </ul>
              </div>

              {/* Conteúdo adicional para testar rolagem */}
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-gray-900/30 p-4 rounded-lg">
                    <p className="text-gray-300">Item de teste {i + 1}</p>
                    <p className="text-sm text-gray-400">Para demonstrar rolagem do modal</p>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
              >
                Fechar Modal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormMinimal;