import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface Categoria {
  id: string;
  nome: string;
}

interface ProductFormProps {
  initialData?: {
    id?: string;
    nome?: string;
    descricao?: string;
    preco?: number;
    imagem_url?: string;
    categoria_id?: string;
    disponivel?: boolean;
    posicao?: number;
  };
  categorias: Categoria[];
  onSubmit: (data: any) => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categorias,
  onSubmit,
  onClose,
  loading = false
}) => {
  console.log('🔵 ProductForm renderizado');
  console.log('🔵 initialData:', initialData);
  console.log('🔵 categorias:', categorias.length);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: 0,
    imagem_url: '',
    categoria_id: '',
    disponivel: true,
    posicao: 1,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Inicializar formData
  useEffect(() => {
    console.log('🔄 useEffect inicializando formData');
    if (initialData) {
      console.log('📋 Usando initialData:', initialData);
      setFormData({
        nome: initialData.nome || '',
        descricao: initialData.descricao || '',
        preco: initialData.preco || 0,
        imagem_url: initialData.imagem_url || '',
        categoria_id: initialData.categoria_id || '',
        disponivel: initialData.disponivel !== false,
        posicao: initialData.posicao || 1,
      });
    } else {
      console.log('📋 Novo produto (sem initialData)');
      // Garantir valores padrão para novo produto
      setFormData({
        nome: '',
        descricao: '',
        preco: 0,
        imagem_url: '',
        categoria_id: categorias.length > 0 ? categorias[0].id : '',
        disponivel: true,
        posicao: 1,
      });
    }
  }, [initialData, categorias]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.nome.trim()) {
      errors.nome = 'Nome do produto é obrigatório';
    }
    
    if (formData.preco <= 0) {
      errors.preco = 'Preço deve ser maior que zero';
    }
    
    if (!formData.categoria_id) {
      errors.categoria_id = 'Selecione uma categoria';
    }
    
    setFormErrors(errors);
    console.log('✅ Validação:', Object.keys(errors).length === 0 ? 'Passou' : 'Falhou', errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Submetendo formulário:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validação falhou');
      return;
    }
    
    console.log('✅ Validação passou, enviando...');
    const success = await onSubmit(formData);
    
    if (success) {
      console.log('🎉 Sucesso ao salvar produto');
      if (!initialData?.id) {
        // Reset form only on success for new products
        setFormData({
          nome: '',
          descricao: '',
          preco: 0,
          imagem_url: '',
          categoria_id: categorias.length > 0 ? categorias[0].id : '',
          disponivel: true,
          posicao: 1,
        });
      }
    } else {
      console.log('❌ Falha ao salvar produto');
    }
  };

  // Função para upload de imagem
  const handleImageUpload = (imageUrl: string) => {
    console.log('📸 Imagem enviada:', imageUrl);
    setFormData({ ...formData, imagem_url: imageUrl });
  };

  // Formatar preço para exibição
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Se não há categorias, mostrar mensagem
  if (categorias.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-2xl border border-gray-700/50 p-8 max-w-md">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Nenhuma categoria disponível
            </h3>
            <p className="text-gray-400 mb-6">
              Você precisa criar pelo menos uma categoria antes de adicionar produtos.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 text-[#400b0b] font-bold rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              {initialData?.id ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <p className="text-gray-400 text-sm">
              {initialData?.id ? 'Atualize os dados do produto' : 'Preencha os dados do novo produto'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome e Preço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent ${
                  formErrors.nome ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="Ex: Cappuccino Tradicional"
                disabled={loading}
              />
              {formErrors.nome && (
                <p className="mt-1 text-sm text-red-400">{formErrors.nome}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preço (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco || ''}
                  onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent ${
                    formErrors.preco ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
              {formErrors.preco && (
                <p className="mt-1 text-sm text-red-400">{formErrors.preco}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Valor de venda do produto
              </p>
            </div>
          </div>

          {/* Categoria e Posição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoria *
              </label>
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white focus:ring-2 focus:ring-[#e58840] focus:border-transparent ${
                  formErrors.categoria_id ? 'border-red-500' : 'border-gray-700'
                }`}
                disabled={loading}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {formErrors.categoria_id && (
                <p className="mt-1 text-sm text-red-400">{formErrors.categoria_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Posição no Cardápio
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={formData.posicao}
                onChange={(e) => setFormData({ ...formData, posicao: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Define a ordem de exibição na categoria
              </p>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição do Produto
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
              placeholder="Descreva o produto para seus clientes..."
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Aparece como texto explicativo no cardápio
            </p>
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Imagem do Produto
            </label>
            <ImageUploader
              currentImage={formData.imagem_url}
              onImageUpload={handleImageUpload}
              disabled={loading}
            />
          </div>

          {/* Disponibilidade */}
          <div className="flex items-center space-x-3 p-4 bg-gray-900/30 rounded-lg">
            <div className="relative">
              <input
                type="checkbox"
                id="disponivel"
                checked={formData.disponivel}
                onChange={(e) => setFormData({ ...formData, disponivel: e.target.checked })}
                className="sr-only"
                disabled={loading}
              />
              <label
                htmlFor="disponivel"
                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  formData.disponivel ? 'bg-green-600' : 'bg-gray-700'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${
                  formData.disponivel ? 'translate-x-7' : 'translate-x-1'
                }`}></span>
              </label>
            </div>
            <div>
              <label htmlFor="disponivel" className="text-gray-300 font-medium cursor-pointer">
                Produto disponível para venda
              </label>
              <p className="text-sm text-gray-500">
                {formData.disponivel 
                  ? 'Os clientes poderão pedir este produto' 
                  : 'Este produto ficará oculto dos clientes'}
              </p>
            </div>
          </div>

          {/* Rodapé com botões */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <span>{initialData?.id ? 'Atualizar Produto' : 'Salvar Produto'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;