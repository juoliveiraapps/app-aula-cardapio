import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import { Produto } from '../types';
import ProductFormMinimal from '../components/admin/ProductFormMinimal';
import ProductList from '../components/admin/ProductList';
import { saveProductToSheet, deleteProductFromSheet } from '../services/adminService';

const AdminCardapio = () => {
  const { produtos: produtosData, categorias, loading, error, refetch } = useCardapioData();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [processing, setProcessing] = useState(false);

  const categorias = categoriasRaw.map(cat => ({
    id: cat.categoria_id,      // ← Mapeia categoria_id para id
    nome: cat.nome || '',
    descricao: cat.descricao || '',
    posicao: cat.posicao || 1,
    visivel: cat.visivel !== false,
    icone_svg: cat.icone_svg || ''
  }));

  console.log('🔍 Categorias da API (raw):', categoriasRaw);
  console.log('🔧 Categorias transformadas:', categorias);
  
  const [showForm, setShowForm] = useState(false);
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
    console.log('📝 Iniciando salvamento do produto:', productData);
    
    try {
      setProcessing(true);
      console.log('🔄 Estado processing definido como true');
      
      // Preparar os dados para envio
      const dataToSend = {
        ...productData,
        // Garantir que o preço seja número
        preco: typeof productData.preco === 'string' 
          ? parseFloat(productData.preco.replace(',', '.')) 
          : productData.preco,
        // Converter disponível para string "true"/"false"
        disponivel: productData.disponivel ? 'TRUE' : 'FALSE',
        // Garantir que tenha ID se for edição
        id: productData.id || '',
      };
      
      console.log('📤 Enviando dados para a planilha:', dataToSend);
      
      const response = await saveProductToSheet(dataToSend);
      
      console.log('✅ Resposta do salvamento:', response);
      
      if (response.success) {
        alert(response.message || '✅ Produto salvo com sucesso!');
        
        // Fechar o modal
        setShowForm(false);
        setEditingProduct(null);
        
        // Recarregar os dados
        if (refetch) {
          console.log('🔄 Recarregando dados via refetch');
          await refetch();
        } else {
          console.log('🔄 Recarregando página');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
        
        return true;
      } else {
        throw new Error(response.message || 'Erro ao salvar produto');
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao salvar produto:', err);
      alert(`❌ Erro: ${err.message || 'Erro desconhecido ao salvar produto'}`);
      return false;
    } finally {
      console.log('🏁 Finalizando, definindo processing como false');
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
      
      const response = await deleteProductFromSheet(id);
      
      console.log('✅ Resposta da exclusão:', response);
      
      if (response.success) {
        alert(response.message || '✅ Produto deletado com sucesso!');
        
        // Recarregar os dados
        if (refetch) {
          await refetch();
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } else {
        throw new Error(response.message || 'Erro ao deletar produto');
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao deletar produto:', err);
      alert(`❌ Erro: ${err.message || 'Erro desconhecido ao deletar produto'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleNewProduct = () => {
    console.log('🆕 Abrindo modal de novo produto');
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: any) => {
    console.log('✏️ Editando produto:', product);
    setEditingProduct(product);
    setShowForm(true);
  };

  const refreshProducts = () => {
    if (refetch) {
      refetch();
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Conteúdo principal da página */}
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
      </div>

      {/* Modal */}
      {showForm && (
        <ProductFormMinimal
          key={editingProduct?.id || 'new'}
          initialData={editingProduct || undefined}
          categorias={categorias}
          onSubmit={handleSaveProduct}
          onClose={() => {
            console.log('🔒 Fechando modal');
            setShowForm(false);
            setEditingProduct(null);
          }}
          loading={processing}
        />
      )}
    </>
  );
};

export default AdminCardapio;