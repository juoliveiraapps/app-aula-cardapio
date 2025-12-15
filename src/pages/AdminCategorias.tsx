import React, { useState, useEffect } from 'react';
import { Plus, Grid, Edit2, Trash2, RefreshCw } from 'lucide-react';
import useCategoriesAPI from '../hooks/useCategoriesAPI';

interface Category {
  id: string;
  nome: string;
  descricao: string;
  posicao: number;
  visivel: boolean;
  icone: string;
}

const AdminCategorias = () => {
  const {
    categories,
    loading,
    error,
    lastUpdate,
    fetchCategories,
    saveCategory,
    deleteCategory
  } = useCategoriesAPI();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    nome: '',
    descricao: '',
    posicao: 1,
    visivel: true,
    icone: '📦'
  });

  // Inicializar formData quando editar
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        id: editingCategory.id,
        nome: editingCategory.nome,
        descricao: editingCategory.descricao,
        posicao: editingCategory.posicao,
        visivel: editingCategory.visivel,
        icone: editingCategory.icone
      });
    }
  }, [editingCategory]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome?.trim()) {
      alert('Nome da categoria é obrigatório');
      return;
    }

    setProcessing(true);
    
    try {
      const success = await saveCategory(formData);
      if (success) {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({
          nome: '',
          descricao: '',
          posicao: categories.length + 1,
          visivel: true,
          icone: '📦'
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    setProcessing(true);
    await deleteCategory(id);
    setProcessing(false);
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setFormData({
      nome: '',
      descricao: '',
      posicao: categories.length + 1,
      visivel: true,
      icone: '📦'
    });
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  // Tela de loading
  if (loading && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Categorias do Cardápio</h3>
            <p className="text-gray-400">Organize os grupos de produtos</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e58840] mb-4"></div>
          <p className="text-gray-400">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Categorias do Cardápio</h3>
          <p className="text-gray-400">
            {categories.length} categorias cadastradas
            {lastUpdate && ` • Atualizado: ${lastUpdate}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleNewCategory}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-400">{error}</p>
            </div>
            <button
              onClick={fetchCategories}
              className="text-red-300 hover:text-white text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Formulário (se aberto) */}
      {showForm && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-white">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h4>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingCategory(null);
              }}
              className="text-gray-400 hover:text-white"
              disabled={processing}
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Categoria *
                </label>
                <input
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                  placeholder="Ex: Cafés Especiais"
                  disabled={processing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ícone
                </label>
                <select
                  value={formData.icone || '📦'}
                  onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                  disabled={processing}
                >
                  <option value="☕">☕ Café</option>
                  <option value="🍰">🍰 Bolo</option>
                  <option value="🧃">🧃 Suco</option>
                  <option value="🥪">🥪 Sanduíche</option>
                  <option value="🥤">🥤 Bebida</option>
                  <option value="🍪">🍪 Doce</option>
                  <option value="🍔">🍔 Lanche</option>
                  <option value="🍟">🍟 Acompanhamento</option>
                  <option value="🥗">🥗 Salada</option>
                  <option value="🍦">🍦 Sobremesa</option>
                  <option value="📦">📦 Padrão</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                placeholder="Descreva esta categoria..."
                disabled={processing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Posição no Menu *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.posicao || categories.length + 1}
                  onChange={(e) => setFormData({ ...formData, posicao: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                  disabled={processing}
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visivel ?? true}
                    onChange={(e) => setFormData({ ...formData, visivel: e.target.checked })}
                    className="w-4 h-4 text-[#e58840] bg-gray-900 border-gray-700 rounded focus:ring-[#e58840] focus:ring-2"
                    disabled={processing}
                  />
                  <span className="text-gray-300">Categoria visível no cardápio</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingCategory ? 'Atualizando...' : 'Salvando...'}
                  </>
                ) : (
                  editingCategory ? 'Atualizar Categoria' : 'Salvar Categoria'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Categorias */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 hover:border-[#e58840]/30 transition-colors ${
                !category.visivel ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-900/70 rounded-lg flex items-center justify-center text-2xl">
                    {category.icone}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{category.nome}</h4>
                    <p className="text-sm text-gray-400 mt-1">{category.descricao}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-900/50 rounded text-gray-400">
                        Posição: {category.posicao}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        category.visivel
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {category.visivel ? 'Visível' : 'Oculta'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditCategory(category)}
                    disabled={processing}
                    className="p-1.5 text-gray-400 hover:text-[#e58840] transition-colors disabled:opacity-50"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={processing}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Nenhuma categoria cadastrada
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando sua primeira categoria para organizar o cardápio.
            </p>
            <button
              onClick={handleNewCategory}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeira Categoria</span>
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default AdminCategorias;