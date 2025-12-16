import React, { useEffect, useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Portal } from '../UI/Portal';
import ImageUploader from './ImageUploader';

interface ProductFormMinimalProps {
  initialData?: any;
  categorias: any[];
  onSubmit: (data: any) => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
}

const ProductFormMinimal: React.FC<ProductFormMinimalProps> = ({
  initialData,
  categorias,
  onSubmit,
  onClose,
  loading = false
}) => {
  console.log('✅ ProductFormMinimal RENDERIZADO com dados:', { 
    initialData, 
    categorias,
    primeiraCategoria: categorias?.[0]
  });

  // ✅ ESTADO CORRETO (sua versão)
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    preco: initialData?.preco ? String(initialData.preco) : '',
    categoria_id:
      initialData?.categoria_id ??
      categorias?.[0]?.categoria_id ??
      '',
    disponivel: initialData?.disponivel !== false,
    posicao: initialData?.posicao || 1,
    imagem_url: initialData?.imagem_url || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Monitorar mudanças no formData
  useEffect(() => {
    console.log('📈 formData atualizado:', {
      ...formData,
      tipoCategoriaId: typeof formData.categoria_id,
      valorCategoriaId: formData.categoria_id,
      categoriaValida: formData.categoria_id && formData.categoria_id !== 'undefined'
    });
  }, [formData]);

  // Impedir rolagem da página quando o modal estiver aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // ✅ HANDLER CORRETO (sua versão)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    console.log(`🔄 Campo ${name} alterado:`, value);

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUploaded = (url: string) => {
    console.log('🖼️ Imagem enviada:', url);
    setFormData(prev => ({ ...prev, imagem_url: url }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do produto é obrigatório';
    }
    
    if (!formData.categoria_id || formData.categoria_id === 'undefined') {
      newErrors.categoria_id = 'Selecione uma categoria';
    }
    
    if (!formData.preco || Number(formData.preco) <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const productData = {
      ...formData,
      preco: Number(formData.preco),
      id: initialData?.id || '',
      opcoes: initialData?.opcoes || []
    };
    
    console.log('📤 Enviando dados do produto:', productData);
    
    const success = await onSubmit(productData);
    if (success) {
      onClose();
    }
  };

  // Se não houver categorias, mostrar mensagem
  if (categorias.length === 0) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-md p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Crie categorias primeiro</h3>
                <p className="text-gray-300">
                  Você precisa criar pelo menos uma categoria antes de adicionar produtos.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold py-3 px-4 rounded-lg transition-all duration-300"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999]">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/70"
          onClick={onClose}
        />

        {/* Container do modal */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {/* Conteúdo do modal */}
          <div className="relative bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {initialData ? 'Editar Produto' : 'Novo Produto'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {initialData ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
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
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Seção 2: Preço e Categoria */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                  Preço e Categoria
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categoria *
                    </label>
                    
                    {/* Debug info */}
                    <div className="mb-2 p-2 bg-gray-900/30 rounded text-xs text-gray-400">
                      <div className="grid grid-cols-2 gap-1">
                        <div>ID selecionado: <span className="text-yellow-400">{formData.categoria_id || 'Nenhum'}</span></div>
                        <div>Tipo: <span className="text-purple-400">{typeof formData.categoria_id}</span></div>
                        <div>Valor: <span className="text-blue-400">"{formData.categoria_id}"</span></div>
                      </div>
                    </div>
                    
                    {/* ✅ SELECT CORRETO (sua versão) */}
                    <select
                      name="categoria_id"
                      value={formData.categoria_id}
                      onChange={handleChange}
                      className={`w-full bg-gray-900/50 border ${
                        errors.categoria_id ? 'border-red-500' : 'border-gray-700'
                      } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors`}
                      disabled={loading}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map(categoria => (
                        <option
                          key={categoria.categoria_id}
                          value={categoria.categoria_id}
                        >
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                    
                               {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {initialData ? 'Atualizar Produto' : 'Criar Produto'}
                    </>
                  )}
                </button>
              </div>
            </form> {/* ← ADICIONE ESTA LINHA PARA FECHAR O FORM */}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ProductFormMinimal;