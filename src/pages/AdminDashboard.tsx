import React, { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Utensils, Coffee, Tag, Settings, LogOut } from 'lucide-react';
import Sidebar from '../components/admin/Sidebar';
import AdminPainelCozinha from './AdminPainelCozinha';
import AdminCardapio from './AdminCardapio';
import AdminCategorias from './AdminCategorias';
import { saveProductToSheet, deleteProductFromSheet } from '../services/adminService';

const AdminDashboard = () => {
  const { logout } = useAdminAuth();
  const [activeMenu, setActiveMenu] = useState<'cozinha' | 'cardapio' | 'categorias'>('cardapio');

  const menuItems = [
    { id: 'cardapio', label: 'Cardápio', icon: Coffee },
    { id: 'categorias', label: 'Categorias', icon: Tag },
    { id: 'cozinha', label: 'Painel da Cozinha', icon: Utensils },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Topbar */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-[#e58840] to-[#e58840]/80 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-[#400b0b]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-sm text-gray-400">Gerencie seu estabelecimento</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Menu Lateral */}
        <aside className="w-64 bg-gray-800/80 backdrop-blur-sm border-r border-gray-700 min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <div className="mb-6 p-3 bg-gray-900/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Menu Principal</p>
              <h2 className="text-sm font-medium text-white">Administração</h2>
            </div>
            
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#e58840] to-[#e58840]/90 text-[#400b0b] font-bold shadow-lg shadow-[#e58840]/25'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#400b0b]' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-[#400b0b] rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Status do Sistema */}
            <div className="mt-8 p-4 bg-gray-900/30 rounded-xl border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Status do Sistema</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Conexão API</span>
                  <span className="inline-flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Última atualização</span>
                  <span className="text-xs text-gray-400">Agora</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          {/* Cabeçalho da Página Ativa */}
          <div className="mb-6">
            {activeMenu === 'cardapio' && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Cardápio</h2>
                  <p className="text-gray-400">Gerencie produtos do seu estabelecimento</p>
                </div>
                <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  {menuItems.find(m => m.id === activeMenu)?.label}
                </div>
              </div>
            )}
            
            {activeMenu === 'categorias' && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Categorias</h2>
                  <p className="text-gray-400">Organize os grupos de produtos</p>
                </div>
                <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  {menuItems.find(m => m.id === activeMenu)?.label}
                </div>
              </div>
            )}
            
            {activeMenu === 'cozinha' && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Painel da Cozinha</h2>
                  <p className="text-gray-400">Configurações do painel de pedidos</p>
                </div>
                <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  {menuItems.find(m => m.id === activeMenu)?.label}
                </div>
              </div>
            )}
          </div>

          {/* Conteúdo Dinâmico */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            {activeMenu === 'cardapio' && <AdminCardapio />}
            {activeMenu === 'categorias' && <AdminCategorias />}
            {activeMenu === 'cozinha' && <AdminPainelCozinha />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;