import React, { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Package, Users, ShoppingCart, Settings, LogOut, Plus } from 'lucide-react';
import ProductForm from '../components/admin/ProductForm'; // ← Remove este import
import ProductList from '../components/admin/ProductList'; // ← Remove este import

// Primeiro, crie os componentes básicos temporários
const TempProductForm = () => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <h3 className="text-xl font-bold text-white mb-4">Formulário de Produto</h3>
    <p className="text-gray-400 mb-6">Componente em desenvolvimento...</p>
    <button
      onClick={() => alert('Formulário será implementado em breve')}
      className="bg-[#e58840] text-[#400b0b] px-4 py-2 rounded-lg font-medium"
    >
      Testar
    </button>
  </div>
);

const TempProductList = () => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <h3 className="text-xl font-bold text-white mb-4">Lista de Produtos</h3>
    <p className="text-gray-400">Carregando produtos do Google Sheets...</p>
  </div>
);

const AdminDashboard = () => {
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Topbar */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#e58840] text-[#400b0b] w-8 h-8 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-[calc(100vh-57px)]">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'products'
                  ? 'bg-[#e58840] text-[#400b0b] font-bold'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Produtos</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#e58840] text-[#400b0b] font-bold'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Pedidos</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'customers'
                  ? 'bg-[#e58840] text-[#400b0b] font-bold'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Clientes</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#e58840] text-[#400b0b] font-bold'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </button>
          </nav>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 p-6">
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Produtos</h2>
                  <p className="text-gray-400">Gerencie o cardápio do estabelecimento</p>
                </div>
                
                <button
                  onClick={() => setActiveTab('new-product')}
                  className="bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Produto</span>
                </button>
              </div>

              <TempProductList />
            </div>
          )}

          {activeTab === 'new-product' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-gray-400 hover:text-white flex items-center space-x-2"
                >
                  ← Voltar para produtos
                </button>
              </div>
              
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-2">Cadastrar Novo Produto</h2>
                <p className="text-gray-400 mb-6">Preencha os dados do produto</p>
                
                <TempProductForm />
              </div>
            </div>
          )}

          {/* Outras abas */}
          {activeTab === 'orders' && (
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-2">Pedidos</h2>
              <p className="text-gray-400">Em desenvolvimento...</p>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-2">Clientes</h2>
              <p className="text-gray-400">Em desenvolvimento...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-2">Configurações</h2>
              <p className="text-gray-400">Em desenvolvimento...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;