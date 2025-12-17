// src/pages/AdminCategorias.tsx
import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import { Categoria } from '../types';
import CategoryForm from '../components/admin/CategoryForm';
import CategoryList from '../components/admin/CategoryList';

const AdminCategorias = () => {
  const { categorias, loading, error, refetch } = useCardapioData();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Converter categorias para o formato do CategoryList
  const categories = categorias.map(cat => ({
    id: cat.id || '',
    nome: cat.nome || '',
    descricao: cat.descricao || '',
    posicao: cat.posicao || 1,
    visivel: cat.visivel !== false,
    icone_svg: cat.icone_svg || '📦' // Default icon
  }));

  // Função para salvar categoria
  const handleSaveCategory = async (categoryData: any): Promise<boolean> => {
    try {
      setProcessing(true);
      setLocalError(null);

      console.log('📝 Salvando categoria:', categoryData);

      const response = await fetch('/api?action=salvarCategoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta da API:', result);

      // Recarregar os dados
      await refetch();

      // Fechar o formulário
      setShowForm(false);
      setEditingCategory(null);

      alert('✅ Categoria salva com sucesso!');
      return true;

    } catch (err: any) {
      console.error('❌ Erro ao salvar categoria:', err);
      setLocalError(err.message || 'Erro ao salvar categoria');
      alert(`Erro: ${err.message || 'Erro desconhecido'}`);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Função para deletar categoria
  const handleDeleteCategory = async (id: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?\n\nATENÇÃO: Todos os produtos desta categoria também serão afetados!')) {
      return;
    }

    try {
      setProcessing(true);
      setLocalError(null);

      console.log('🗑️ Deletando categoria ID:', id);

      const response = await fetch('/api?action=deletarCategoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta da API:', result);

      // Recarregar os dados
      await refetch();

      alert('✅ Categoria deletada com sucesso!');

    } catch (err: any) {
      console.error('❌ Erro ao deletar categoria:', err);
      setLocalError(err.message || 'Erro ao deletar categoria');
      alert(`Erro: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const refreshCategories = async () => {
    await refetch();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Categorias do Cardápio</h3>
          <p className="text-gray-400">
            {categories.length} categorias cadastradas • 
            {categories.filter(c => c.visivel).length} visíveis
            {error && ` • Erro: ${error}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshCategories}
            disabled={loading || processing}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          
          <button
            onClick={handleNewCategory}
            disabled={processing}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-[#e58840]/20"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Nova Categoria</span>
          </button>
        </div>
      </div>

      {/* Mensagens de erro */}
      {(error || localError) && (
        <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-red-400 text-2xl">⚠️</span>
              <div>
                <p className="text-red-400 font-semibold">Erro ao carregar dados</p>
                <p className="text-red-300 text-sm mt-1">
                  {error || localError}
                </p>
              </div>
            </div>
            <button
              onClick={refreshCategories}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              disabled={loading}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      {processing && (
        <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <p className="text-blue-400">Processando...</p>
          </div>
        </div>
      )}

      {/* Lista de Categorias */}
      <CategoryList
        categories={categories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        loading={loading && categories.length === 0}
        emptyMessage={
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">
              Nenhuma categoria cadastrada
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando sua primeira categoria para organizar seus produtos.
            </p>
            <button
              onClick={handleNewCategory}
              className="px-6 py-3 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 text-[#400b0b] font-bold rounded-lg"
            >
              Criar Primeira Categoria
            </button>
          </div>
        }
      />

      {/* Modal do Formulário */}
      {showForm && (
        <CategoryForm
          initialData={editingCategory || undefined}
          onSubmit={handleSaveCategory}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          loading={processing}
        />
      )}
    </div>
  );
};

export default AdminCategorias;