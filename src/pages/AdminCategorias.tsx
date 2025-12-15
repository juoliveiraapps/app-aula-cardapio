import React, { useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import { Categoria } from '../types';
import IconSelector from '../components/admin/IconSelector'; // Vamos criar este componente

interface CategoryFormData {
  id?: string;
  nome: string;
  descricao: string;
  posicao: number;
  visivel: boolean;
  icone_svg: string;
}

const AdminCategorias = () => {
  const { categorias, loading, error } = useCardapioData();
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    nome: '',
    descricao: '',
    posicao: 1,
    visivel: true,
    icone_svg: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4' // Ícone padrão (Coffee)
  });

  // Converter categorias do formato antigo para o novo formato
  const categories: CategoryFormData[] = categorias.map(cat => ({
    id: cat.id,
    nome: cat.nome,
    descricao: cat.descricao || '',
    posicao: cat.posicao || 1,
    visivel: cat.visivel !== false,
    icone_svg: cat.icone_svg || 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4' // Fallback para ícone café
  }));

  // Atualizar formData quando editar
  React.useEffect(() => {
    if (editingCategory) {
      setFormData({
        id: editingCategory.id,
        nome: editingCategory.nome,
        descricao: editingCategory.descricao || '',
        posicao: editingCategory.posicao || 1,
        visivel: editingCategory.visivel !== false,
        icone_svg: editingCategory.icone_svg || 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
      });
    }
  }, [editingCategory]);

  // Função para salvar categoria
  const saveCategory = async (categoryData: CategoryFormData): Promise<boolean> => {
    try {
      setProcessing(true);
      
      console.log('📝 Salvando categoria:', categoryData);
      
      const API_KEY = "cce4d5770afe09d2c790dcca4272e1190462a6a574270b040c835889115c6914";
      const API_URL = `${window.location.origin}/api`;
      
      const response = await fetch(`${API_URL}?action=salvarCategoria&key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Categoria salva com sucesso');
        alert(data.message || 'Categoria salva com sucesso!');
        
        // Recarregar a página para atualizar os dados
        window.location.reload();
        
        return true;
      } else {
        throw new Error(data.error || 'Erro ao salvar categoria');
      }
    } catch (err: any) {
      console.error('❌ Erro ao salvar categoria:', err);
      alert(`Erro: ${err.message || 'Erro desconhecido'}`);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Função para deletar categoria
  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!id) return false;
    
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      return false;
    }

    try {
      setProcessing(true);
      
      console.log('🗑️ Deletando categoria ID:', id);
      
      const API_KEY = "cce4d5770afe09d2c790dcca4272e1190462a6a574270b040c835889115c6914";
      const API_URL = `${window.location.origin}/api`;
      
      const response = await fetch(`${API_URL}?action=deletarCategoria&key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Categoria deletada com sucesso');
        alert(data.message || 'Categoria deletada com sucesso!');
        
        // Recarregar a página para atualizar os dados
        window.location.reload();
        
        return true;
      } else {
        throw new Error(data.error || 'Erro ao deletar categoria');
      }
    } catch (err: any) {
      console.error('❌ Erro ao deletar categoria:', err);
      alert(`Erro: ${err.message || 'Erro desconhecido'}`);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome?.trim()) {
      alert('Nome da categoria é obrigatório');
      return;
    }

    const success = await saveCategory(formData);
    if (success) {
      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        nome: '',
        descricao: '',
        posicao: categories.length + 1,
        visivel: true,
        icone_svg: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
      });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setFormData({
      nome: '',
      descricao: '',
      posicao: categories.length + 1,
      visivel: true,
      icone_svg: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
    });
    setShowForm(true);
  };

  const handleEditCategory = (category: CategoryFormData) => {
    setEditingCategory(category as Categoria);
    setShowForm(true);
  };

  const refreshCategories = () => {
    window.location.reload();
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

  // Componente para renderizar ícone SVG
  const renderIconSVG = (svgPath: string, size: number = 24) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-300"
      >
        {svgPath.split(' ').map((path, index) => (
          <path key={index} d={path} />
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Categorias do Cardápio</h3>
          <p className="text-gray-400">
            {categories.length} categorias cadastradas
            {error && ` • Erro: ${error}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshCategories}
            disabled={loading || processing}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleNewCategory}
            disabled={processing}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
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
              onClick={refreshCategories}
              className="text-red-300 hover:text-white text-sm"
              disabled={loading}
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
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                  placeholder="Ex: Cafés Especiais"
                  disabled={processing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Posição no Menu *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.posicao}
                  onChange={(e) => setFormData({ ...formData, posicao: parseInt(e.target.value) || 1 })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                  disabled={processing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
                placeholder="Descreva esta categoria..."
                disabled={processing}
              />
            </div>

            {/* Seletor de Ícones */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ícone da Categoria
              </label>
              <div className="mb-3">
                <div className="text-sm text-gray-400 mb-2">Ícone selecionado:</div>
                <div className="flex items-center justify-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3">
                    {renderIconSVG(formData.icone_svg, 32)}
                    <span className="text-gray-300 text-sm font-mono truncate max-w-xs">
                      {formData.icone_svg}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {/* Ícones comuns para cafeteria */}
                {[
                  { name: 'Café', path: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4' },
                  { name: 'Bolo', path: 'M6 2v2 M18 2v2 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M3 10h18 M8 14h8' },
                  { name: 'Suco', path: 'M17 2h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2 M7 22h10 M12 2v20' },
                  { name: 'Sanduíche', path: 'M18 8L22 12L18 16 M6 8L2 12L6 16 M14.5 12H2 M21.5 12H14.5' },
                  { name: 'Bebida', path: 'M7 2h10l4 14H3L7 2z M10 16v6 M14 16v6' },
                  { name: 'Doce', path: 'M10 3.5V10M14 3.5V10M18 10a8 8 0 1 1-16 0V3.5' },
                  { name: 'Garfo', path: 'M15 21v-8a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v8 M17 21V11a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10' },
                  { name: 'Faca', path: 'M15.5 9l-6.06 6.06a2 2 0 1 0 2.83 2.83L18.34 11.5' },
                  { name: 'Colher', path: 'M10 2v2.343 M14 2v3.343 M8 10h8 M2 2h20v20H2z M4 12h16v8H4z' },
                  { name: 'Xícara', path: 'M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z M6 1v3 M10 1v3 M14 1v3' },
                  { name: 'Garrafa', path: 'M10 2v2 M14 2v2 M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1 M6 2v2' },
                  { name: 'Estrela', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
                  { name: 'Coração', path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
                  { name: 'Fogo', path: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' },
                  { name: 'Folha', path: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z' },
                  { name: 'Pizza', path: 'M12 2a10 10 0 1 0 10 10H12V2z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
                ].map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icone_svg: icon.path })}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                      formData.icone_svg === icon.path
                        ? 'bg-[#e58840]/20 border-[#e58840]'
                        : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 hover:border-gray-600'
                    }`}
                    disabled={processing}
                  >
                    {renderIconSVG(icon.path, 20)}
                    <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ou insira manualmente o SVG path:
                </label>
                <textarea
                  value={formData.icone_svg}
                  onChange={(e) => setFormData({ ...formData, icone_svg: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent font-mono text-sm"
                  placeholder="Ex: M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4"
                  disabled={processing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: cada comando SVG separado por espaço (ex: M12 2v20 M17 5H9.5...)
                </p>
              </div>
            </div>

            <div className="flex items-center pt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visivel}
                  onChange={(e) => setFormData({ ...formData, visivel: e.target.checked })}
                  className="w-4 h-4 text-[#e58840] bg-gray-900 border-gray-700 rounded focus:ring-[#e58840] focus:ring-2"
                  disabled={processing}
                />
                <span className="text-gray-300">Categoria visível no cardápio</span>
              </label>
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
                  <div className="w-12 h-12 bg-gray-900/70 rounded-lg flex items-center justify-center">
                    {renderIconSVG(category.icone_svg, 24)}
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
                    onClick={() => handleDelete(category.id!)}
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
              disabled={processing}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
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