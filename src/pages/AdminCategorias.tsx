// src/pages/AdminCategorias.tsx
import React, { useState } from 'react';
import { Plus, RefreshCw, Check, X, AlertCircle, Tag, Eye, EyeOff } from 'lucide-react';
import { useCardapioData } from '../hooks/useCardapioData';
import CategoryForm from '../components/admin/CategoryForm';
import { saveCategoryToSheet, deleteCategoryFromSheet } from '../services/adminService';

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

const AdminCategorias = () => {
  const { categorias: categoriasRaw, loading, error, refetch } = useCardapioData();
  
  // Estados para mensagens Toast
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  } | null>(null);

  // Estados para modal
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  // Converter categorias para o formato correto
  const categories = categoriasRaw.map(cat => ({
    id: cat.categoria_id || cat.id || '',
    categoria_id: cat.categoria_id || cat.id || '',
    nome: cat.nome || '',
    descricao: cat.descricao || '',
    posicao: cat.posicao || 1,
    visivel: cat.visivel !== false,
    icone_svg: cat.icone_svg || 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
  }));

  // Função para mostrar mensagem Toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
  };

  // Função para fechar Toast
  const closeToast = () => {
    setToast(null);
  };

  // Função para salvar categoria
  const handleSaveCategory = async (categoryData: any): Promise<boolean> => {
    try {
      setProcessing(true);
      console.log('📝 Salvando categoria:', categoryData);

      // Preparar os dados para envio (CRÍTICO: usar campo correto)
      const dataToSend = {
        ...categoryData,
        visivel: categoryData.visivel ? 'TRUE' : 'FALSE',
        // Se tiver "id", garantir que seja usado como categoria_id no backend
        ...(categoryData.id && { categoria_id: categoryData.id })
      };

      console.log('📤 Enviando dados da categoria:', dataToSend);
      
      const response = await saveCategoryToSheet(dataToSend);
      
      console.log('✅ Resposta da API:', response);

      if (response.success) {
        const isEdit = !!categoryData.id;
        const message = isEdit 
          ? '✅ Categoria atualizada com sucesso!' 
          : '✅ Categoria cadastrada com sucesso!';
        
        showToast(message, 'success');
        
        // Fechar o formulário
        setShowForm(false);
        setEditingCategory(null);
        
        // Recarregar os dados
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

  // Função para deletar categoria
  const handleDeleteCategory = async (id: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?\n\nATENÇÃO: Todos os produtos desta categoria também serão afetados!')) {
      return;
    }

    try {
      setProcessing(true);
      console.log('🗑️ Deletando categoria ID:', id);
      
      const response = await deleteCategoryFromSheet(id);
      
      console.log('✅ Resposta da exclusão:', response);
      
      if (response.success) {
        showToast('✅ Categoria deletada com sucesso!', 'success');
        
        // Recarregar os dados
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

  const handleNewCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const refreshCategories = async () => {
    if (refetch) {
      try {
        await refetch();
        showToast('✅ Lista atualizada com sucesso!', 'success');
      } catch (error) {
        showToast('❌ Erro ao atualizar lista', 'error');
      }
    }
  };

  // Função para renderizar ícone SVG
  const renderIconSVG = (svgPath: string, size: number = 24) => {
    if (!svgPath) return null;
    
    const commands = svgPath.split(/(?=[A-Z])/).filter(cmd => cmd.trim());
    
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
        className="text-[#e58840]"
      >
        {commands.map((command, index) => (
          <path key={index} d={command.trim()} />
        ))}
      </svg>
    );
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
      
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Categorias do Cardápio</h3>
            <div className="flex items-center space-x-4 text-gray-400">
              <span className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span>{categories.length} categorias cadastradas</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{categories.filter(c => c.visivel).length} visíveis</span>
              </span>
              {error && <span className="text-red-400">• Erro: {error}</span>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshCategories}
              disabled={loading || processing}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Atualizar</span>
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
        {error && (
          <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-2xl">⚠️</span>
                <div>
                  <p className="text-red-400 font-semibold">Erro ao carregar dados</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
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
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-700/50">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">
              Nenhuma categoria cadastrada
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Comece criando sua primeira categoria para organizar seus produtos no cardápio.
            </p>
            <button
              onClick={handleNewCategory}
              className="px-6 py-3 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300"
            >
              Criar Primeira Categoria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-700 group-hover:border-[#e58840]/30 transition-colors">
                      {renderIconSVG(category.icone_svg, 20)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-[#e58840] transition-colors">
                        {category.nome}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-900/50 rounded-full text-gray-400">
                          Posição {category.posicao}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                          category.visivel 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-gray-900/50 text-gray-400'
                        }`}>
                          {category.visivel ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{category.visivel ? 'Visível' : 'Oculta'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1.5 bg-gray-700 hover:bg-yellow-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                      title="Editar categoria"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1.5 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                      title="Excluir categoria"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {category.descricao && (
                  <p className="text-sm text-gray-400 mt-3 mb-4 line-clamp-2">
                    {category.descricao}
                  </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">
                      ID: {category.id}
                    </span>
                    <span className="text-xs text-gray-400">
                      Criado em: {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default AdminCategorias;