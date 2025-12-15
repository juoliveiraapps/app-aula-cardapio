import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface Categoria {
  id: string;
  nome: string;
}

interface ProdutoOption {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  tipo: 'tamanho' | 'adicional' | 'personalizacao';
  obrigatorio: boolean;
  multipla_escolha: boolean;
  opcoes?: string[];
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
    opcoes?: ProdutoOption[];
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
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: 0,
    imagem_url: '',
    categoria_id: '',
    disponivel: true,
    posicao: 1,
    opcoes: [] as ProdutoOption[]
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [editingOption, setEditingOption] = useState<ProdutoOption | null>(null);
  const [optionFormData, setOptionFormData] = useState({
    nome: '',
    descricao: '',
    preco: 0,
    tipo: 'tamanho' as 'tamanho' | 'adicional' | 'personalizacao',
    obrigatorio: false,
    multipla_escolha: false,
    opcoes: [] as string[]
  });

  // Tipos de opção disponíveis
  const optionTypes = [
    { value: 'tamanho', label: 'Tamanho (P, M, G)' },
    { value: 'adicional', label: 'Adicional (Queijo, Bacon, etc.)' },
    { value: 'personalizacao', label: 'Personalização (Sem açúcar, etc.)' }
  ];

  // Inicializar formData
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        descricao: initialData.descricao || '',
        preco: initialData.preco || 0,
        imagem_url: initialData.imagem_url || '',
        categoria_id: initialData.categoria_id || '',
        disponivel: initialData.disponivel !== false,
        posicao: initialData.posicao || 1,
        opcoes: initialData.opcoes || []
      });
    }
  }, [initialData]);

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
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const success = await onSubmit(formData);
    if (success && !initialData?.id) {
      // Reset form only on success for new products
      setFormData({
        nome: '',
        descricao: '',
        preco: 0,
        imagem_url: '',
        categoria_id: '',
        disponivel: true,
        posicao: 1,
        opcoes: []
      });
    }
  };

  // Funções para gerenciar opções
  const handleAddOption = () => {
    if (!optionFormData.nome.trim()) {
      alert('Nome da opção é obrigatório');
      return;
    }

    const newOption: ProdutoOption = {
      id: editingOption?.id || Date.now().toString(),
      ...optionFormData
    };

    const updatedOptions = editingOption
      ? formData.opcoes.map(opt => opt.id === editingOption.id ? newOption : opt)
      : [...formData.opcoes, newOption];

    setFormData({ ...formData, opcoes: updatedOptions });
    setShowOptionForm(false);
    setEditingOption(null);
    resetOptionForm();
  };

  const handleEditOption = (option: ProdutoOption) => {
    setEditingOption(option);
    setOptionFormData({
      nome: option.nome,
      descricao: option.descricao || '',
      preco: option.preco,
      tipo: option.tipo,
      obrigatorio: option.obrigatorio,
      multipla_escolha: option.multipla_escolha,
      opcoes: option.opcoes || []
    });
    setShowOptionForm(true);
  };

  const handleDeleteOption = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta opção?')) {
      setFormData({
        ...formData,
        opcoes: formData.opcoes.filter(opt => opt.id !== id)
      });
    }
  };

  const resetOptionForm = () => {
    setOptionFormData({
      nome: '',
      descricao: '',
      preco: 0,
      tipo: 'tamanho',
      obrigatorio: false,
      multipla_escolha: false,
      opcoes: []
    });
  };

  // Função para adicionar sub-opção
  const handleAddSubOption = () => {
    const subOption = prompt('Digite o nome da sub-opção (ex: "Pequeno"):');
    if (subOption && subOption.trim()) {
      setOptionFormData({
        ...optionFormData,
        opcoes: [...optionFormData.opcoes, subOption.trim()]
      });
    }
  };

  const handleDeleteSubOption = (index: number) => {
    const newSubOptions = optionFormData.opcoes.filter((_, i) => i !== index);
    setOptionFormData({ ...optionFormData, opcoes: newSubOptions });
  };

  // Função para upload de imagem
  const handleImageUpload = (imageUrl: string) => {
    setFormData({ ...formData, imagem_url: imageUrl });
  };

  // Formatar preço para exibição
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
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

            {/* Preço */}
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
                  value={formData.preco}
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
            {/* Categoria */}
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
                disabled={loading || categorias.length === 0}
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
              {categorias.length === 0 && (
                <p className="mt-1 text-sm text-yellow-400">
                  Nenhuma categoria disponível. Crie categorias primeiro.
                </p>
              )}
            </div>

            {/* Posição */}
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

          {/* Opções do Produto */}
          <div className="border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-white">Opções do Produto</h4>
                <p className="text-gray-400 text-sm">
                  Tamanhos, adicionais e personalizações
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOptionForm(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Opção</span>
              </button>
            </div>

            {/* Lista de Opções */}
            {formData.opcoes.length > 0 ? (
              <div className="space-y-3">
                {formData.opcoes.map((option) => (
                  <div
                    key={option.id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">{option.nome}</span>
                          <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
                            {option.tipo}
                          </span>
                          {option.obrigatorio && (
                            <span className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded">
                              Obrigatório
                            </span>
                          )}
                        </div>
                        {option.descricao && (
                          <p className="text-sm text-gray-400 mt-1">{option.descricao}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-300">
                            {formatPrice(option.preco)}
                          </span>
                          {option.multipla_escolha && (
                            <span className="text-xs text-blue-400">Múltipla escolha</span>
                          )}
                        </div>
                        {option.opcoes && option.opcoes.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Sub-opções:</p>
                            <div className="flex flex-wrap gap-1">
                              {option.opcoes.map((sub, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditOption(option)}
                          className="p-1.5 text-gray-400 hover:text-[#e58840] transition-colors"
                          title="Editar opção"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOption(option.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          title="Excluir opção"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-900/30 rounded-lg">
                <div className="text-3xl mb-2">⚙️</div>
                <p className="text-gray-400">Nenhuma opção configurada</p>
                <p className="text-sm text-gray-500 mt-1">
                  Adicione tamanhos, adicionais ou personalizações
                </p>
              </div>
            )}
          </div>

          {/* Formulário de Opção (Modal) */}
          {showOptionForm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
              <div className="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-md">
                <div className="p-6 border-b border-gray-700/50">
                  <h4 className="text-lg font-bold text-white">
                    {editingOption ? 'Editar Opção' : 'Nova Opção'}
                  </h4>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Nome da Opção */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome da Opção *
                    </label>
                    <input
                      type="text"
                      value={optionFormData.nome}
                      onChange={(e) => setOptionFormData({ ...optionFormData, nome: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                      placeholder="Ex: Tamanho, Adicionais"
                    />
                  </div>

                  {/* Tipo da Opção */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Opção
                    </label>
                    <select
                      value={optionFormData.tipo}
                      onChange={(e) => setOptionFormData({ 
                        ...optionFormData, 
                        tipo: e.target.value as any 
                      })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    >
                      {optionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preço Adicional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preço Adicional (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={optionFormData.preco}
                      onChange={(e) => setOptionFormData({ ...optionFormData, preco: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  {/* Sub-opções (para tamanhos, etc.) */}
                  {optionFormData.tipo === 'tamanho' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Sub-opções (Tamanhos)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddSubOption}
                          className="text-sm text-[#e58840] hover:text-[#e58840]/80"
                        >
                          + Adicionar
                        </button>
                      </div>
                      <div className="space-y-2">
                        {optionFormData.opcoes.map((subOption, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-900/30 p-2 rounded">
                            <span className="text-gray-300">{subOption}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubOption(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configurações */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="obrigatorio"
                        checked={optionFormData.obrigatorio}
                        onChange={(e) => setOptionFormData({ ...optionFormData, obrigatorio: e.target.checked })}
                        className="w-4 h-4 text-[#e58840] bg-gray-900 border-gray-700 rounded"
                      />
                      <label htmlFor="obrigatorio" className="text-sm text-gray-300">
                        Obrigatório
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="multipla_escolha"
                        checked={optionFormData.multipla_escolha}
                        onChange={(e) => setOptionFormData({ ...optionFormData, multipla_escolha: e.target.checked })}
                        className="w-4 h-4 text-[#e58840] bg-gray-900 border-gray-700 rounded"
                      />
                      <label htmlFor="multipla_escolha" className="text-sm text-gray-300">
                        Múltipla escolha
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-700/50 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionForm(false);
                      setEditingOption(null);
                      resetOptionForm();
                    }}
                    className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700/50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-4 py-2 bg-[#e58840] text-[#400b0b] font-bold rounded-lg hover:bg-[#e58840]/90"
                  >
                    {editingOption ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          )}

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