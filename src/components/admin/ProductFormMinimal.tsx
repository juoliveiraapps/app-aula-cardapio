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
    totalCategorias: categorias.length,
    primeiraCategoria: categorias[0] 
  });

  // Debug: log das categorias
  useEffect(() => {
    console.log('📊 Categorias recebidas:', categorias.map(c => ({
      id: c.id,
      nome: c.nome,
      tipoId: typeof c.id
    })));
  }, [categorias]);

  // Estado com debug
  const [formData, setFormData] = useState(() => {
    const initialCategoriaId = initialData?.categoria_id || (categorias[0]?.id || '');
    console.log('🔄 Inicializando formData:', {
      initialCategoriaId,
      hasInitialData: !!initialData,
      defaultCategoria: categorias[0]?.id
    });
    
    return {
      nome: initialData?.nome || '',
      descricao: initialData?.descricao || '',
      preco: initialData?.preco ? Number(initialData.preco) : '',
      categoria_id: initialCategoriaId,
      disponivel: initialData?.disponivel !== false,
      posicao: initialData?.posicao || 1,
      imagem_url: initialData?.imagem_url || ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Monitorar mudanças no formData
  useEffect(() => {
    console.log('📈 formData atualizado:', {
      ...formData,
      categoriaNome: categorias.find(c => c.id === formData.categoria_id)?.nome
    });
  }, [formData, categorias]);

  // Impedir rolagem da página quando o modal estiver aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handler específico para select com debug
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('🎯 SELECT CHANGE - Evento:', {
      name,
      value,
      targetValue: e.target.value,
      eventType: e.type
    });
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log('🔄 Novo estado para', name, ':', newData[name]);
      return newData;
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'preco') {
      const sanitizedValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
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
    
    if (!formData.categoria_id) {
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

  // Formatar preço para exibição
  const formatPrice = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Encontrar categoria atual para display
  const categoriaAtual = categorias.find(c => c.id === formData.categoria_id);

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
              {/* Seção 1: Informações básicas */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                  Informações Básicas
                </h4>
                
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className={`w-full bg-gray-900/50 border ${
                      errors.nome ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors`}
                    placeholder="Ex: Pizza Calabresa"
                    disabled={loading}
                  />
                  {errors.nome && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors resize-none"
                    placeholder="Descreva o produto (ingredientes, acompanhamentos, etc.)"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Seção 2: Preço e Categoria */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                  Preço e Categoria
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preço */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preço (R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        R$
                      </span>
                      <input
                        type="text"
                        name="preco"
                        value={formData.preco}
                        onChange={handleChange}
                        className={`w-full bg-gray-900/50 border ${
                          errors.preco ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors`}
                        placeholder="0,00"
                        disabled={loading}
                      />
                    </div>
                    {errors.preco && (
                      <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.preco}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-400">
                      Valor exibido: R$ {formatPrice(formData.preco)}
                    </p>
                  </div>

                  {/* Categoria - COM DEBUG E CORREÇÕES */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categoria *
                    </label>
                    
                    {/* Área de debug */}
                    <div className="mb-2 p-2 bg-gray-900/30 rounded text-xs text-gray-400">
                      <div className="grid grid-cols-2 gap-1">
                        <div>ID selecionado: <span className="text-yellow-400">{formData.categoria_id || 'Nenhum'}</span></div>
                        <div>Categoria: <span className="text-green-400">{categoriaAtual?.nome || 'Nenhuma'}</span></div>
                        <div>Total: <span className="text-blue-400">{categorias.length}</span></div>
                        <div>Tipo ID: <span className="text-purple-400">{typeof formData.categoria_id}</span></div>
                      </div>
                    </div>
                    
                    {/* Select corrigido */}
                    <div className="relative">
                      <select
                        name="categoria_id"
                        value={formData.categoria_id}
                        onChange={handleSelectChange}
                        onClick={(e) => {
                          console.log('🖱️ Select clicado');
                          e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                          console.log('🖱️ Mouse down no select');
                          e.stopPropagation();
                        }}
                        className={`w-full bg-gray-900/50 border ${
                          errors.categoria_id ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors appearance-none pr-10`}
                        disabled={loading}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categorias.map(categoria => (
                          <option 
                            key={categoria.id} 
                            value={categoria.id}
                            className="py-2"
                          >
                            {categoria.nome}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Botões de teste */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (categorias[0]) {
                            console.log('🔧 Forçando seleção da primeira categoria:', categorias[0].id);
                            setFormData(prev => ({ ...prev, categoria_id: categorias[0].id }));
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                      >
                        Selecionar 1ª
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (categorias[1]) {
                            console.log('🔧 Forçando seleção da segunda categoria:', categorias[1].id);
                            setFormData(prev => ({ ...prev, categoria_id: categorias[1].id }));
                          }
                        }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                      >
                        Selecionar 2ª
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('📋 Estado atual:', {
                            formData,
                            categoriaAtual,
                            categorias
                          });
                        }}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                      >
                        Log Estado
                      </button>
                    </div>
                    
                    {errors.categoria_id && (
                      <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.categoria_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção 3: Imagem do Produto */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                  Imagem do Produto
                </h4>
                
                <ImageUploader
                  onImageUploaded={handleImageUploaded}
                  currentImage={formData.imagem_url}
                  disabled={loading}
                />

                {/* Campo de URL para compatibilidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ou cole uma URL da imagem:
                  </label>
                  <input
                    type="text"
                    name="imagem_url"
                    value={formData.imagem_url}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors"
                    placeholder="https://exemplo.com/imagem.jpg"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Seção 4: Configurações */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                  Configurações
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Posição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Posição no Cardápio
                    </label>
                    <input
                      type="number"
                      name="posicao"
                      value={formData.posicao}
                      onChange={handleChange}
                      min="1"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors"
                      disabled={loading}
                    />
                    <p className="mt-2 text-sm text-gray-400">
                      Número que define a ordem no cardápio
                    </p>
                  </div>

                  {/* Disponibilidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status do Produto
                    </label>
                    <div className="flex items-center h-12">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="disponivel"
                            checked={formData.disponivel}
                            onChange={handleChange}
                            className="sr-only"
                            disabled={loading}
                          />
                          <div className={`block w-14 h-8 rounded-full ${
                            formData.disponivel ? 'bg-green-600' : 'bg-gray-700'
                          } transition-colors`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                            formData.disponivel ? 'transform translate-x-6' : ''
                          }`}></div>
                        </div>
                        <div className="ml-3">
                          <span className={`font-medium ${
                            formData.disponivel ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {formData.disponivel ? 'Disponível' : 'Indisponível'}
                          </span>
                          <p className="text-sm text-gray-500">
                            {formData.disponivel ? 'Visível no cardápio' : 'Oculto do cardápio'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

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
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ProductFormMinimal;