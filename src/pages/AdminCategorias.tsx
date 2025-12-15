import React, { useState } from 'react';
import { Plus, Grid, Edit2, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  nome: string;
  descricao: string;
  posicao: number;
  visivel: boolean;
  icone?: string;
}

const AdminCategorias = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', nome: 'Cafés', descricao: 'Cafés especiais', posicao: 1, visivel: true, icone: '☕' },
    { id: '2', nome: 'Bolos', descricao: 'Bolos caseiros', posicao: 2, visivel: true, icone: '🍰' },
    { id: '3', nome: 'Sucos', descricao: 'Sucos naturais', posicao: 3, visivel: true, icone: '🧃' },
    { id: '4', nome: 'Sanduíches', descricao: 'Lanches', posicao: 4, visivel: false, icone: '🥪' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleSave = (categoryData: Partial<Category>) => {
    if (editingCategory) {
      // Atualizar categoria existente
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
      ));
    } else {
      // Adicionar nova categoria
      const newCategory: Category = {
        id: Date.now().toString(),
        nome: categoryData.nome || '',
        descricao: categoryData.descricao || '',
        posicao: categoryData.posicao || categories.length + 1,
        visivel: categoryData.visivel !== false,
        icone: categoryData.icone || '📦',
      };
      setCategories([...categories, newCategory]);
    }
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Categorias do Cardápio</h3>
          <p className="text-gray-400">Organize os grupos de produtos</p>
        </div>
        
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

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
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSave({
              nome: formData.get('nome') as string,
              descricao: formData.get('descricao') as string,
              posicao: parseInt(formData.get('posicao') as string),
              visivel: formData.get('visivel') === 'on',
              icone: formData.get('icone') as string,
            });
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Categoria *
                </label>
                <input
                  name="nome"
                  defaultValue={editingCategory?.nome}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                  placeholder="Ex: Cafés Especiais"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ícone
                </label>
                <select
                  name="icone"
                  defaultValue={editingCategory?.icone || '📦'}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                >
                  <option value="☕">☕ Café</option>
                  <option value="🍰">🍰 Bolo</option>
                  <option value="🧃">🧃 Suco</option>
                  <option value="🥪">🥪 Sanduíche</option>
                  <option value="🥤">🥤 Bebida</option>
                  <option value="🍪">🍪 Doce</option>
                  <option value="📦">📦 Padrão</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                defaultValue={editingCategory?.descricao}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                placeholder="Descreva esta categoria..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Posição no Menu *
                </label>
                <input
                  name="posicao"
                  type="number"
                  min="1"
                  defaultValue={editingCategory?.posicao || categories.length + 1}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    name="visivel"
                    type="checkbox"
                    defaultChecked={editingCategory?.visivel ?? true}
                    className="w-4 h-4 text-[#e58840] bg-gray-900 border-gray-700 rounded focus:ring-[#e58840] focus:ring-2"
                  />
                  <span className="text-gray-300">Categoria visível no cardápio</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold py-3 px-4 rounded-lg transition-all duration-300"
              >
                {editingCategory ? 'Atualizar Categoria' : 'Salvar Categoria'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 hover:border-[#e58840]/30 transition-colors"
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
                  onClick={() => {
                    setEditingCategory(category);
                    setShowForm(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-[#e58840] transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategorias;