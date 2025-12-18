// src/pages/AdminCardapio.tsx
import React, { useState } from 'react';
import { Plus, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import { Produto } from '../types';
import ProductFormMinimal from '../components/admin/ProductFormMinimal';
import ProductList from '../components/admin/ProductList';
import { saveProductToSheet, deleteProductFromSheet } from '../services/adminService';

// Componente Toast para mensagens rápidas
const Toast = ({ message, type, onClose }: { 
  message: string; 
  type: 'success' | 'error'; 
  onClose: () => void;
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[1000] animate-slide-in">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${
        type === 'success' 
          ? 'bg-green-900/90 border border-green-800' 
          : 'bg-red-900/90 border border-red-800'
      }`}>
        <div className={`flex-shrink-0 ${
          type === 'success' ? 'text-green-400' : 'text-red-400'
        }`}>
          {type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${
            type === 'success' ? 'text-green-100' : 'text-red-100'
          }`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 hover:opacity-80 ${
            type === 'success' ? 'text-green-300' : 'text-red-300'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AdminCardapio = () => {
  const { produtos: produtosData, categorias: categoriasRaw, loading, error, refetch } = useCardapioData();
  
  // Estados para mensagens Toast
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  } | null>(null);

  // Estados para modal
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [processing, setProcessing] = useState(false);

  // 🔧 TRANSFORMAÇÃO DAS CATEGORIAS (apenas para select do formulário)
  const categorias = categoriasRaw.map(cat => ({
    id: cat.categoria_id || cat.id || '',
    categoria_id: cat.categoria_id || cat.id || '',
    nome: cat.nome || '',
    descricao: cat.descricao || '',
    posicao: cat.posicao || 1,
    visivel: cat.visivel !== false,
    icone_svg: cat.icone_svg || ''
  }));

  // Converter produtos para o formato do ProductList
  const produtos = produtosData.map(prod => {
    const cat = categorias.find(c => c.id === prod.categoria_id || c.categoria_id === prod.categoria_id);
    
    return {
      id: prod.produto_id || '',
      produto_id: prod.produto_id || '',
      nome: prod.nome || '',
      descricao: prod.descricao || '',
      preco: prod.preco || 0,
      imagem_url: prod.imagem_url || '',
      categoria_id: prod.categoria_id || '',
      categoria_nome: cat?.nome || '',
      disponivel: prod.disponivel !== false,
      posicao: prod.posicao || 1,
      opcoes: prod.opcoes || []
    };
  });

  // Função para mostrar mensagem Toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
  };

  // Função para fechar Toast
  const closeToast = () => {
    setToast(null);
  };

  const handleSaveProduct = async (productData: any): Promise<boolean> => {
    console.log('📝 Iniciando salvamento do produto:', productData);
    
    try {
      setProcessing(true);
      
      // Preparar os dados para envio (CRÍTICO)
      const dataToSend = {
        ...productData,
        // Converter preço corretamente
        preco: typeof productData.preco === 'string' 
          ? parseFloat(productData.preco.replace(',', '.')) 
          : productData.preco,
        // Converter disponível para string
        disponivel: productData.disponivel ? 'TRUE' : 'FALSE',
        // ⚠️ IMPORTANTE: Usar produto_id se disponível
        ...(productData.produto_id && { produto_id: productData.produto_id }),
        ...(productData.id && !productData.produto_id && { produto_id: productData.id })
      };
      
      // Remover campo id antigo se existir
      if (dataToSend.id) {
        delete dataToSend.id;
      }
      
      console.log('📤 Enviando dados para API:', dataToSend);
      
      const response = await saveProductToSheet(dataToSend);
      
      console.log('✅ Resposta do salvamento:', response);
      
      if (response.success) {
        const isEdit = !!productData.produto_id || !!productData.id;
        const message = isEdit 
          ? '✅ Produto atualizado com sucesso!' 
          : '✅ Produto cadastrado com sucesso!';
        
        showToast(message, 'success');
        
        // Fechar o modal
        setShowForm(false);
        setEditingProduct(null);
        
        // Recarregar os dados
        if (refetch) {
          await refetch();
        }
        
        return true;
      } else {
        throw new Error(response.message || 'Erro ao salvar produto');
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao salvar produto:', err);
      showToast(`❌ Erro: ${err.message || 'Erro ao salvar produto'}`, 'error');
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
      
      const response = await deleteProductFromSheet(id);
      
      console.log('✅ Resposta da exclusão:', response);
      
      if (response.success) {
        showToast('✅ Produto deletado com sucesso!', 'success');
        
        // Recarregar os dados
        if (refetch) {
          await refetch();
        }
      } else {
        throw new Error(response.message || 'Erro ao deletar produto');
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao deletar produto:', err);
      showToast(`❌ Erro: ${err.message || 'Erro ao deletar produto'}`, 'error');
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

  const refreshProducts = async () => {
    if (refetch) {
      try {
        await refetch();
        showToast('✅ Lista atualizada com sucesso!', 'success');
      } catch (error) {
        showToast('❌ Erro ao atualizar lista', 'error');
      }
    }
  };

  return (
    <>
      {/* Estilos do Toast */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
      
      {/* Conteúdo principal da página */}
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Produtos do Cardápio</h3>
            <div className="flex items-center space-x-4 text-gray-400 mt-1">
              <span>{produtos.length} produtos cadastrados</span>
              <span>{produtos.filter(p => p.disponivel).length} disponíveis</span>
              {categorias.length > 0 && (
                <span>{categorias.length} categorias disponíveis</span>
              )}
              {error && <span className="text-red-400">• Erro: {error}</span>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshProducts}
              disabled={loading || processing}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Atualizar</span>
            </button>
            
            <button
              onClick={handleNewProduct}
              disabled={processing || categorias.length === 0}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-[#e58840]/20"
              title={categorias.length === 0 ? 'Crie categorias primeiro' : 'Adicionar novo produto'}
            >
              <Plus className="w-5 h-5" />
              <span className="font-bold">Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Aviso se não houver categorias */}
        {categorias.length === 0 && (
          <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <span className="text-yellow-400 text-2xl">⚠️</span>
              <div>
                <h3 className="text-yellow-400 font-bold text-lg">Crie categorias primeiro</h3>
                <p className="text-yellow-300/80">
                  Você precisa criar pelo menos uma categoria antes de adicionar produtos.
                  Acesse a página de <strong>Categorias</strong> para criar suas primeiras categorias.
                </p>
                <div className="mt-3">
                  <a 
                    href="/admin/categorias" 
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <span>Ir para Categorias</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

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
                className="text-red-300 hover:text-white text-sm font-medium"
                disabled={loading}
              >
                Tentar novamente
              </button>
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
          emptyMessage={
            categorias.length === 0 
              ? "Acesse a página de Categorias para criar categorias primeiro"
              : "Nenhum produto cadastrado. Comece criando seu primeiro produto!"
          }
        />
      </div>

      {/* Modal de Produto */}
      {showForm && (
        <ProductFormMinimal
          key={editingProduct?.id || 'new'}
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

      {/* Toast Notification */}
      {toast?.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  );
};

export default AdminCardapio;