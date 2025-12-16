import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import { Produto } from '../types';
import ProductForm from '../components/admin/ProductForm';
import ProductList from '../components/admin/ProductList';
import { saveProductToSheet, deleteProductFromSheet } from '../services/adminService';
import ProductFormMinimal from '../components/admin/ProductFormMinimal';

const AdminCardapio = () => {
  const { produtos: produtosData, categorias, loading, error } = useCardapioData();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [processing, setProcessing] = useState(false);

  console.log('🟢 AdminCardapio renderizado');
  console.log('🟢 showForm:', showForm);
  console.log('🟢 produtosData:', produtosData.length);
  console.log('🟢 categorias:', categorias.length);

  // Monitorar mudanças no showForm
  useEffect(() => {
    console.log('🔄 showForm mudou para:', showForm);
  }, [showForm]);

  // Converter produtos para o formato do ProductList com keys únicas
  const produtos = produtosData.map((prod, index) => {
    const categoria = categorias.find(c => c.id === prod.categoria_id);
    return {
      id: prod.id || `prod-${index}-${Date.now()}`,
      nome: prod.nome || '',
      descricao: prod.descricao || '',
      preco: prod.preco || 0,
      imagem_url: prod.imagem_url || '',
      categoria_id: prod.categoria_id || '',
      categoria_nome: categoria?.nome || '',
      disponivel: prod.disponivel !== false,
      posicao: prod.posicao || 1,
      opcoes: prod.opcoes || []
    };
  });

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
    console.log('🎯 Botão Novo Produto clicado');
    console.log('🎯 categorias disponíveis:', categorias.length);
    
    if (categorias.length === 0) {
      alert('Crie categorias primeiro!');
      return;
    }
    
    console.log('🎯 Definindo editingProduct como null');
    console.log('🎯 Definindo showForm como true');
    setEditingProduct(null);
    setShowForm(true);
    
    // Debug: verificar após um tick
    setTimeout(() => {
      console.log('🎯 Após timeout, showForm deve ser true');
    }, 0);
  };

  const handleEditProduct = (product: any) => {
    console.log('✏️ Editando produto:', product);
    setEditingProduct(product);
    setShowForm(true);
  };

  const refreshProducts = () => {
    window.location.reload();
  };

  const handleCloseForm = () => {
    console.log('✋ Fechando ProductForm');
    setShowForm(false);
    setEditingProduct(null);
  };

  // Teste: Adicionar um botão de debug
  const openTestModal = () => {
    console.log('🧪 Abrindo modal de teste');
    // Criar um modal simples diretamente no DOM para testar
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: #1f2937;
          padding: 2rem;
          border-radius: 1rem;
          color: white;
          max-width: 400px;
        ">
          <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">
            Modal de Teste JS
          </h3>
          <p>Se você vê isso, o problema está no React.</p>
          <button onclick="this.parentElement.parentElement.remove()" 
            style="
              margin-top: 1rem;
              background: #e58840;
              color: #400b0b;
              font-weight: bold;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              width: 100%;
            ">
            Fechar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  return (
    <div className="space-y-6 relative">
      {/* Botão de debug (remova depois) */}
      <div className="absolute top-0 right-0">
        <button
          onClick={openTestModal}
          className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg"
        >
          Teste Modal JS
        </button>
      </div>

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

      {/* Modal do Formulário - COM DEBUG VISUAL */}
   {showForm && (
  <ProductFormMinimal
    categorias={categorias}
    onSubmit={handleSaveProduct}
    onClose={handleCloseForm}
    loading={processing}
  />
)}

      {/* Modal real (comentado temporariamente) */}
      {false && showForm && (
        <ProductForm
          initialData={editingProduct || undefined}
          categorias={categorias}
          onSubmit={handleSaveProduct}
          onClose={handleCloseForm}
          loading={processing}
        />
      )}
    </div>
  );
};

export default AdminCardapio;