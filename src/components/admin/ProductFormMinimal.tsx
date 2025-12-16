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
    <>
      {/* Overlay com z-index alto */}
      <div 
        className="fixed inset-0 bg-black/70 z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal com z-index mais alto */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="relative bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Cabeçalho */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4">
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

          {/* Conteúdo */}
          <div className="p-6">
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
    </>
  );
};

export default ProductFormMinimal;