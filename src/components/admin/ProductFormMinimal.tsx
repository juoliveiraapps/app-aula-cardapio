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
  console.log('✅ ProductFormMinimal renderizado');
  console.log('📊 Props recebidas:', {
    hasInitialData: !!initialData,
    initialCategoriaId: initialData?.categoria_id,
    totalCategorias: categorias.length,
    primeiraCategoria: categorias[0]
  });

  // Estado simplificado
  const [nome, setNome] = useState(initialData?.nome || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [preco, setPreco] = useState(initialData?.preco ? Number(initialData.preco).toString() : '');
  const [categoriaId, setCategoriaId] = useState(initialData?.categoria_id || '');
  const [disponivel, setDisponivel] = useState(initialData?.disponivel !== false);
  const [posicao, setPosicao] = useState(initialData?.posicao || 1);
  const [imagem_url, setImagemUrl] = useState(initialData?.imagem_url || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debug: logar mudanças na categoria
  useEffect(() => {
    console.log('🔄 Categoria atual:', categoriaId, 
      'Nome:', categorias.find(c => c.id === categoriaId)?.nome);
  }, [categoriaId, categorias]);

  // Impedir rolagem da página
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handlers diretos e simples
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNome(e.target.value);
    if (errors.nome) setErrors(prev => ({ ...prev, nome: '' }));
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescricao(e.target.value);
  };

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, '');
    setPreco(value);
    if (errors.preco) setErrors(prev => ({ ...prev, preco: '' }));
  };

  // Handler DIRETO para categoria - SEM complicações
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('🔄 Categoria alterada para:', value);
    setCategoriaId(value);
    if (errors.categoria_id) setErrors(prev => ({ ...prev, categoria_id: '' }));
  };

  const handleDisponivelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisponivel(e.target.checked);
  };

  const handlePosicaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosicao(parseInt(e.target.value) || 1);
  };

  const handleImageUploaded = (url: string) => {
    console.log('🖼️ Imagem enviada:', url);
    setImagemUrl(url);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!nome.trim()) newErrors.nome = 'Nome do produto é obrigatório';
    if (!categoriaId) newErrors.categoria_id = 'Selecione uma categoria';
    if (!preco || Number(preco.replace(',', '.')) <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Validação falhou');
      return;
    }
    
    const productData = {
      nome,
      descricao,
      preco: Number(preco.replace(',', '.')),
      categoria_id: categoriaId,
      disponivel,
      posicao,
      imagem_url,
      id: initialData?.id || '',
      opcoes: initialData?.opcoes || []
    };
    
    console.log('📤 Enviando dados:', productData);
    
    const success = await onSubmit(productData);
    if (success) {
      onClose();
    }
  };

  // Se não houver categorias
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

  // Encontrar categoria atual para exibir
  const categoriaAtual = categorias.find(c => c.id === categoriaId);
  
  return (
    <Portal>
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
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
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={handleNomeChange}
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
                  value={descricao}
                  onChange={handleDescricaoChange}
                  rows={3}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors resize-none"
                  placeholder="Descreva o produto..."
                  disabled={loading}
                />
              </div>

              {/* Preço e Categoria */}
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
                      value={preco}
                      onChange={handlePrecoChange}
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
                </div>

                {/* Categoria - VERSÃO SIMPLIFICADA */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <div className="relative">
                    <select
                      value={categoriaId}
                      onChange={handleCategoriaChange}
                      className={`w-full bg-gray-900/50 border ${
                        errors.categoria_id ? 'border-red-500' : 'border-gray-700'
                      } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors appearance-none`}
                      disabled={loading}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map(categoria => (
                        <option 
                          key={categoria.id} 
                          value={categoria.id}
                        >
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.categoria_id && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.categoria_id}
                    </p>
                  )}
                  {/* Feedback visual */}
                  <div className="mt-2 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      categoriaAtual 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-gray-900/30 text-gray-400'
                    }`}>
                      {categoriaAtual 
                        ? `✅ ${categoriaAtual.nome}` 
                        : '❌ Nenhuma categoria selecionada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagem do Produto
                </label>
                <ImageUploader
                  onImageUploaded={handleImageUploaded}
                  currentImage={imagem_url}
                  disabled={loading}
                />
              </div>

              {/* URL da imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={imagem_url}
                  onChange={(e) => setImagemUrl(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors"
                  placeholder="https://exemplo.com/imagem.jpg"
                  disabled={loading}
                />
              </div>

              {/* Posição e Disponibilidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Posição
                  </label>
                  <input
                    type="number"
                    value={posicao}
                    onChange={handlePosicaoChange}
                    min="1"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e58840]/50 focus:border-transparent transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Disponibilidade
                  </label>
                  <div className="flex items-center h-12">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={disponivel}
                          onChange={handleDisponivelChange}
                          className="sr-only"
                          disabled={loading}
                        />
                        <div className={`block w-14 h-8 rounded-full ${
                          disponivel ? 'bg-green-600' : 'bg-gray-700'
                        }`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          disponivel ? 'transform translate-x-6' : ''
                        }`}></div>
                      </div>
                      <span className="ml-3 text-gray-300">
                        {disponivel ? 'Disponível' : 'Indisponível'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
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