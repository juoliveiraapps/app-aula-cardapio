import React, { useState } from 'react';
import { Plus, RefreshCw, Check, X, AlertCircle, Tag } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import { Produto } from '../types';
import ProductFormMinimal from '../components/admin/ProductFormMinimal';
import CategoryForm from '../components/admin/CategoryForm';
import ProductList from '../components/admin/ProductList';
import { 
  saveProductToSheet, 
  deleteProductFromSheet, 
  saveCategoryToSheet, 
  deleteCategoryFromSheet 
} from '../services/adminService';

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

// Estilos CSS para animação do Toast
const toastStyles = `
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
`;

const AdminCardapio = () => {
  const { produtos: produtosData, categorias: categoriasRaw, loading, error, refetch } = useCardapioData();
  
  // Estados para mensagens Toast
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  } | null>(null);

  // Estados para modais
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  // 🔧 TRANSFORMAÇÃO DAS CATEGORIAS
  const categorias = categoriasRaw.map(cat => ({
    id: cat.id || cat.categoria_id || '',
    categoria_id: cat.categoria_id || cat.id || '',
    nome: cat.nome || '',
    descricao: cat.descricao || '',
    posicao: cat.posicao || 1,
    visivel: cat.visivel !== false,
    icone_svg: cat.icone_svg || ''
  }));

  console.log('🔍 Categorias transformadas:', categorias);
  
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

  // ========== FUNÇÕES PARA PRODUTOS ==========

  const handleSaveProduct = async (productData: any): Promise<boolean> => {
    console.log('📝 Iniciando salvamento do produto:', productData);
    
    try {
      setProcessing(true);
      
      // Preparar os dados para envio
      const dataToSend = {
        ...productData,
        preco: typeof productData.preco === 'string' 
          ? parseFloat(productData.preco.replace(',', '.')) 
          : productData.preco,
        disponivel: productData.disponivel ? 'TRUE' : 'FALSE',
        ...(productData.id && { produto_id: productData.id })
      };
      
      if (dataToSend.id) {
        delete dataToSend.id;
      }
      
      console.log('📤 Enviando produto para API:', dataToSend);
      
      const response = await saveProductToSheet(dataToSend);
      
      console.log('✅ Resposta do salvamento:', response);
      
      if (response.success) {
        const isEdit = !!productData.id || !!productData.produto_id;
        const message = isEdit 
          ? '✅ Produto atualizado com sucesso!' 
          : '✅ Produto cadastrado com sucesso!';
        
        showToast(message, 'success');
        setShowProductForm(false);
        setEditingProduct(null);
        
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

  // ========== FUNÇÕES PARA CATEGORIAS ==========

  const handleSaveCategory = async (categoryData: any): Promise<boolean> => {
    console.log('📝 Salvando categoria:', categoryData);
    
    try {
      setProcessing(true);
      
      // Preparar os dados para envio
      const dataToSend = {
        ...categoryData,
        visivel: categoryData.visivel ? 'TRUE' : 'FALSE',
      };
      
      console.log('📤 Enviando dados da categoria:', dataToSend);
      
      const response = await saveCategoryToSheet(dataToSend);
      
      console.log('✅ Resposta do salvamento da categoria:', response);
      
      if (response.success) {
        const isEdit = !!categoryData.id;
        const message = isEdit 
          ? '✅ Categoria atualizada com sucesso!' 
          : '✅ Categoria cadastrada com sucesso!';
        
        showToast(message, 'success');
        setShowCategoryForm(false);
        setEditingCategory(null);
        
        if (refetch) {
          await refetch();
        }
        
        return true;
      } else {
        throw new Error(response.message || 'Erro ao salvar categoria');
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao salvar categoria:', err);
      showToast(`❌ Erro: ${err.message || 'Erro ao salvar categoria'}`, 'error');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCategory = async (id: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    try {
      setProcessing(true);
      console.log('🗑️ Deletando categoria ID:', id);
      
      const response = await deleteCategoryFromSheet(id);
      
      console.log('✅ Resposta da exclusão da categoria:', response);
      
      if (response.success) {
        showToast('✅ Categoria deletada com sucesso!', 'success');
        
        if (refetch) {
          await refetch();
        }
      } else {
        throw new Error(response.message || 'Erro ao deletar categoria');
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao deletar categoria:', err);
      showToast(`❌ Erro: ${err.message || 'Erro ao deletar categoria'}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  // ========== FUNÇÕES AUXILIARES ==========

  const handleNewProduct = () => {
    console.log('🆕 Abrindo modal de novo produto');
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: any) => {
    console.log('✏️ Editando produto:', product);
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleNewCategory = () => {
    console.log('🆕 Abrindo modal de nova categoria');
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: any) => {
    console.log('✏️ Editando categoria:', category);
    setEditingCategory(category);
    setShowCategoryForm(true);
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

  // ========== RENDERIZAÇÃO ==========

  return (
    <>
      {/* Estilos do Toast */}
      <style>{toastStyles}</style>
      
      {/* Conteúdo principal da página */}
      <div className="space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Administração do Cardápio</h1>
            <p className="text-gray-400">
              Gerencie seus produtos e categorias
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
              onClick={handleNewCategory}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
              title="Adicionar nova categoria"
            >
              <Tag className="w-4 h-4" />
              <span>Nova Categoria</span>
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
          <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <span className="text-yellow-400 text-2xl">⚠️</span>
              <div>
                <h3 className="text-yellow-400 font-bold text-lg">Crie sua primeira categoria</h3>
                <p className="text-yellow-300/80">
                  Você precisa criar pelo menos uma categoria antes de adicionar produtos.
                  Clique em "Nova Categoria" para começar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Categorias */}
        <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Categorias do Cardápio</h3>
              <p className="text-gray-400">
                {categorias.length} categorias cadastradas • 
                {categorias.filter(c => c.visivel).length} visíveis no cardápio
              </p>
            </div>
            <button
              onClick={handleNewCategory}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-lg transition-colors disabled:opacity-50"
              title="Adicionar nova categoria"
            >
              <Tag className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
          
          {categorias.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-2">Nenhuma categoria cadastrada</p>
              <p className="text-sm text-gray-500">Crie sua primeira categoria para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map(categoria => (
                <div 
                  key={categoria.id} 
                  className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-700 group-hover:border-[#e58840]/30 transition-colors">
                        <svg
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[#e58840]"
                        >
                          {categoria.icone_svg?.split(/(?=[A-Z])/)
                            .filter(cmd => cmd.trim())
                            .map((command, index) => (
                              <path key={index} d={command.trim()} />
                            ))}
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-[#e58840] transition-colors">
                          {categoria.nome}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-900/50 rounded-full text-gray-400">
                            Posição {categoria.posicao}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            categoria.visivel 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-gray-900/50 text-gray-400'
                          }`}>
                            {categoria.visivel ? 'Visível' : 'Oculta'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditCategory(categoria)}
                        className="p-1.5 bg-gray-700 hover:bg-yellow-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                        title="Editar categoria"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(categoria.id)}
                        className="p-1.5 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                        title="Excluir categoria"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {categoria.descricao && (
                    <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                      {categoria.descricao}
                    </p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-700/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-mono">
                        ID: {categoria.id}
                      </span>
                      <span className="text-xs text-gray-400">
                        {produtos.filter(p => p.categoria_id === categoria.id).length} produtos
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Produtos */}
        <ProductList
          produtos={produtos}
          categorias={categorias}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          loading={loading && produtos.length === 0}
          emptyMessage={
            categorias.length === 0 
              ? "Crie categorias primeiro para adicionar produtos"
              : "Nenhum produto cadastrado. Comece criando seu primeiro produto!"
          }
        />
      </div>

      {/* Modal de Produto */}
      {showProductForm && (
        <ProductFormMinimal
          key={editingProduct?.id || 'new'}
          initialData={editingProduct || undefined}
          categorias={categorias}
          onSubmit={handleSaveProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          loading={processing}
        />
      )}

      {/* Modal de Categoria */}
      {showCategoryForm && (
        <CategoryForm
          key={editingCategory?.id || 'new'}
          initialData={editingCategory || undefined}
          onSubmit={handleSaveCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
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