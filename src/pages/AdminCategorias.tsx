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

  // Converter categorias para o formato do CategoryList
  const categories = categorias.map(cat => ({
    id: cat.id || '',
    nome: cat.nome || '',
    descricao: cat.descricao || '',
    posicao: cat.posicao || 1,
    visivel: cat.visivel !== false,
    icone_svg: cat.icone_svg || 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
  }));

  // Função para salvar categoria
  const handleSaveCategory = async (categoryData: any): Promise<boolean> => {
    try {
      setProcessing(true);
      
      console.log('📝 Salvando categoria:', categoryData);
      
      const API_KEY = "cce4d5770afe09d2c790dcca4272e1190462a6a574270b040c835889115c6914";
      const API_URL = "https://script.google.com/macros/s/AKfycbzrEMAZ9jap-LMpi5_VrlZsVvpGyBwNzL6YAVPeG06ZSQDNsb7sIuj5UsWF2x4xzZt8MA/exec";
      
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
        console.log('✅ Categoria salva com sucesso:', data);
        alert(data.message || 'Categoria salva com sucesso!');
        
        // Recarregar os dados usando refetch
        await refetch();
        
        // Fechar o formulário
        setShowForm(false);
        setEditingCategory(null);
        return true;
      } else {
        throw new Error(data.error || data.message || 'Erro ao salvar categoria');
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
  const handleDeleteCategory = async (id: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    try {
      setProcessing(true);
      
      console.log('🗑️ Deletando categoria ID:', id);
      
      const API_KEY = "cce4d5770afe09d2c790dcca4272e1190462a6a574270b040c835889115c6914";
      const API_URL = "https://script.google.com/macros/s/AKfycbzrEMAZ9jap-LMpi5_VrlZsVvpGyBwNzL6YAVPeG06ZSQDNsb7sIuj5UsWF2x4xzZt8MA/exec";
      
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
        console.log('✅ Categoria deletada com sucesso:', data);
        alert(data.message || 'Categoria deletada com sucesso!');
        
        // Recarregar os dados usando refetch
        await refetch();
      } else {
        throw new Error(data.error || data.message || 'Erro ao deletar categoria');
      }
    } catch (err: any) {
      console.error('❌ Erro ao deletar categoria:', err);
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
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
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

      {/* Lista de Categorias */}
      <CategoryList
        categories={categories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        loading={loading && categories.length === 0}
        emptyMessage="Nenhuma categoria cadastrada. Comece criando sua primeira categoria!"
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