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

interface OpcaoExtra {
  id: string;
  rotulo: string;
  acrescimo: number;
}

interface GrupoOpcao {
  id: string;
  rotulo: string;
  tipo: 'radio' | 'checkbox' | 'select';
  obrigatorio: boolean;
  opcoes: OpcaoExtra[];
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

  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    preco: initialData?.preco ? String(initialData.preco) : '',
    categoria_id: initialData?.categoria_id ?? categorias?.[0]?.categoria_id ?? '',
    disponivel: initialData?.disponivel !== false,
    posicao: initialData?.posicao || 1,
    imagem_url: initialData?.imagem_url || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('📈 formData atualizado:', {
      ...formData,
      tipoCategoriaId: typeof formData.categoria_id,
      valorCategoriaId: formData.categoria_id,
      categoriaValida: formData.categoria_id && formData.categoria_id !== 'undefined'
    });
  }, [formData]);

  const [gruposOpcoes, setGruposOpcoes] = useState<GrupoOpcao[]>(
  initialData?.opcoes || []
);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    opcoes: gruposOpcoes  // ← ADICIONE ESTA LINHA
  };
  
  console.log('📤 Enviando dados do produto:', productData);
  
  const success = await onSubmit(productData);
  if (success) {
    onClose();
  }
};
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
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                  Preço e Categoria
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categoria *
                    </label>
                    
                   
                    
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
                        <option key={categoria.categoria_id} value={categoria.categoria_id}>
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                    
                  
                    {errors.categoria_id && (
                      <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.categoria_id}
                      </p>
                    )}
                  </div>

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
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                  Informações Básicas
                </h4>
                
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

                            {/* Seção 5: Opções Extras (Tamanho, Extras, etc.) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                    Opções Extras
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const novoId = `grupo_${Date.now()}`;
                      setGruposOpcoes(prev => [
                        ...prev,
                        {
                          id: novoId,
                          rotulo: 'Novo Grupo',
                          tipo: 'radio',
                          obrigatorio: false,
                          opcoes: []
                        }
                      ]);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#e58840] hover:bg-[#e58840]/90 text-[#400b0b] text-sm font-medium rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <span>+</span>
                    <span>Adicionar Grupo</span>
                  </button>
                </div>
                
                <p className="text-sm text-gray-400">
                  Adicione opções como tamanhos (P, M, G), extras (queijo extra, bacon) ou complementos.
                </p>

                {gruposOpcoes.length === 0 ? (
                  <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-6 text-center">
                    <p className="text-gray-400">Nenhuma opção extra configurada</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Ex: Tamanhos (Pequeno, Médio, Grande) ou Extras (Queijo Extra, Bacon)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {gruposOpcoes.map((grupo, grupoIndex) => (
                      <div key={grupo.id} className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-4">
                        {/* Cabeçalho do Grupo */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                value={grupo.rotulo}
                                onChange={(e) => {
                                  const novosGrupos = [...gruposOpcoes];
                                  novosGrupos[grupoIndex].rotulo = e.target.value;
                                  setGruposOpcoes(novosGrupos);
                                }}
                                className="bg-transparent text-white text-lg font-semibold border-none focus:outline-none focus:ring-0 w-auto"
                                placeholder="Ex: Tamanho"
                                disabled={loading}
                              />
                              <span className="text-xs px-2 py-1 bg-gray-800 rounded">
                                {grupo.tipo === 'radio' ? 'Escolha Única' : 
                                 grupo.tipo === 'checkbox' ? 'Múltipla Escolha' : 'Lista'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setGruposOpcoes(prev => 
                                prev.filter((_, i) => i !== grupoIndex)
                              );
                            }}
                            className="text-gray-400 hover:text-red-400 p-1"
                            disabled={loading}
                            title="Remover grupo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Configurações do Grupo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Tipo
                            </label>
                            <select
                              value={grupo.tipo}
                              onChange={(e) => {
                                const novosGrupos = [...gruposOpcoes];
                                novosGrupos[grupoIndex].tipo = e.target.value as 'radio' | 'checkbox' | 'select';
                                setGruposOpcoes(novosGrupos);
                              }}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                              disabled={loading}
                            >
                              <option value="radio">Escolha Única (Radio)</option>
                              <option value="checkbox">Múltipla Escolha (Checkbox)</option>
                              <option value="select">Lista Suspensa (Select)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Obrigatório
                            </label>
                            <div className="flex items-center h-10">
                              <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={grupo.obrigatorio}
                                    onChange={(e) => {
                                      const novosGrupos = [...gruposOpcoes];
                                      novosGrupos[grupoIndex].obrigatorio = e.target.checked;
                                      setGruposOpcoes(novosGrupos);
                                    }}
                                    className="sr-only"
                                    disabled={loading}
                                  />
                                  <div className={`block w-10 h-6 rounded-full ${
                                    grupo.obrigatorio ? 'bg-green-600' : 'bg-gray-700'
                                  }`}></div>
                                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                    grupo.obrigatorio ? 'transform translate-x-4' : ''
                                  }`}></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-300">
                                  {grupo.obrigatorio ? 'Sim' : 'Não'}
                                </span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => {
                                const novosGrupos = [...gruposOpcoes];
                                const novoId = `opcao_${Date.now()}_${grupoIndex}`;
                                novosGrupos[grupoIndex].opcoes.push({
                                  id: novoId,
                                  rotulo: 'Nova Opção',
                                  acrescimo: 0
                                });
                                setGruposOpcoes(novosGrupos);
                              }}
                              className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded transition-colors"
                              disabled={loading}
                            >
                              <span>+</span>
                              <span>Adicionar Opção</span>
                            </button>
                          </div>
                        </div>

                        {/* Lista de Opções do Grupo */}
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-400 mb-2">
                            Opções Disponíveis:
                          </label>
                          
                          {grupo.opcoes.length === 0 ? (
                            <div className="text-center py-3 text-gray-500 text-sm">
                              Nenhuma opção adicionada
                            </div>
                          ) : (
                            grupo.opcoes.map((opcao, opcaoIndex) => (
                              <div key={opcao.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={opcao.rotulo}
                                    onChange={(e) => {
                                      const novosGrupos = [...gruposOpcoes];
                                      novosGrupos[grupoIndex].opcoes[opcaoIndex].rotulo = e.target.value;
                                      setGruposOpcoes(novosGrupos);
                                    }}
                                    className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#e58840]"
                                    placeholder="Ex: Pequeno"
                                    disabled={loading}
                                  />
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                      R$
                                    </span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={opcao.acrescimo}
                                      onChange={(e) => {
                                        const novosGrupos = [...gruposOpcoes];
                                        novosGrupos[grupoIndex].opcoes[opcaoIndex].acrescimo = parseFloat(e.target.value) || 0;
                                        setGruposOpcoes(novosGrupos);
                                      }}
                                      className="w-full bg-gray-900 border border-gray-700 rounded pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#e58840]"
                                      placeholder="0,00"
                                      disabled={loading}
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const novosGrupos = [...gruposOpcoes];
                                    novosGrupos[grupoIndex].opcoes = novosGrupos[grupoIndex].opcoes.filter(
                                      (_, i) => i !== opcaoIndex
                                    );
                                    setGruposOpcoes(novosGrupos);
                                  }}
                                  className="text-gray-400 hover:text-red-400 p-1"
                                  disabled={loading}
                                  title="Remover opção"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pré-visualização do JSON */}
                <div className="mt-4">
                  <details className="bg-gray-900/30 border border-gray-700/50 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm text-gray-400 hover:text-white">
                      Visualizar JSON das Opções
                    </summary>
                    <div className="px-4 pb-4">
                      <pre className="text-xs bg-gray-900 p-3 rounded overflow-auto max-h-40 text-gray-300">
                        {JSON.stringify(gruposOpcoes, null, 2)}
                      </pre>
                      <p className="text-xs text-gray-500 mt-2">
                        Este JSON será salvo junto com o produto.
                      </p>
                    </div>
                  </details>
                </div>
              </div>


              

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                  Imagem do Produto
                </h4>
                
                <ImageUploader
                  onImageUploaded={handleImageUploaded}
                  currentImage={formData.imagem_url}
                  disabled={loading}
                />

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

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                  Configurações
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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