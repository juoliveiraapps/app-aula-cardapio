import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import { Produto } from '../types';
import ProductForm from '../components/admin/ProductForm';
import ProductList from '../components/admin/ProductList';
import { saveProductToSheet, deleteProductFromSheet } from '../services/adminService';

const AdminCardapio = () => {
  const { produtos: produtosData, categorias, loading, error } = useCardapioData();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [processing, setProcessing] = useState(false);

  // Converter produtos para o formato do ProductList
  const produtos = produtosData.map(prod => ({
    id: prod.id || '',
    nome: prod.nome || '',
    descricao: prod.descricao || '',
    preco: prod.preco || 0,
    imagem_url: prod.imagem_url || '',
    categoria_id: prod.categoria_id || '',
    categoria_nome: categorias.find(c => c.id === prod.categoria_id)?.nome || '',
    disponivel: prod.disponivel !== false,
    posicao: prod.posicao || 1,
    opcoes: prod.opcoes || []
  }));

 const handleSaveProduct = async (productData: any): Promise<boolean> => {
  try {
    setProcessing(true);
    console.log('📝 Salvando produto:', productData);
    
    const data = await saveProductToSheet(productData);
    
    console.log('✅ Produto salvo com sucesso:', data);
    alert(data.message || 'Produto salvo com sucesso!');
    
    // Recarregar a página para atualizar os dados
    window.location.reload();
    return true;
    
  } catch (err: any) {
    console.error('❌ Erro ao salvar produto:', err);
    alert(`Erro: ${err.message || 'Erro desconhecido'}`);
    return false;
  } finally {
    setProcessing(false);
  }
};

const handleDeleteProduct = async (id: string): Promise<void> => {
  if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
    return;
  }

  try {
    setProcessing(true);
    console.log('🗑️ Deletando produto ID:', id);
    
    const data = await deleteProductFromSheet(id);
    
    console.log('✅ Produto deletado com sucesso:', data);
    alert(data.message || 'Produto deletado com sucesso!');
    
    // Recarregar a página para atualizar os dados
    window.location.reload();
    
  } catch (err: any) {
    console.error('❌ Erro ao deletar produto:', err);
    alert(`Erro: ${err.message || 'Erro desconhecido'}`);
  } finally {
    setProcessing(false);
  }
};

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const refreshProducts = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Produtos do Cardápio</h3>
          <p className="text-gray-400">
            {produtos.length} produtos cadastrados
            {error && ` • Erro: ${error}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshProducts}
            disabled={loading || processing}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          
          <button
            onClick={handleNewProduct}
            disabled={processing || categorias.length === 0}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
            title={categorias.length === 0 ? 'Crie categorias primeiro' : 'Adicionar novo produto'}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
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
              onClick={refreshProducts}
              className="text-red-300 hover:text-white text-sm"
              disabled={loading}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Aviso se não houver categorias */}
      {categorias.length === 0 && (
        <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-yellow-400 text-xl">⚠️</span>
            <div>
              <p className="text-yellow-400 font-medium">Crie categorias primeiro</p>
              <p className="text-yellow-300/80 text-sm">
                Você precisa criar pelo menos uma categoria antes de adicionar produtos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <ProductList
        produtos={produtos}
        categorias={categorias}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        loading={loading && produtos.length === 0}
        emptyMessage="Nenhum produto cadastrado. Comece criando seu primeiro produto!"
      />

      {/* Modal do Formulário */}
      {showForm && (
        <ProductForm
          initialData={editingProduct || undefined}
          categorias={categorias}
          onSubmit={handleSaveProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          loading={processing}
        />
      )}
    </div>
  );
};

export default AdminCardapio;