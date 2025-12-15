import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Coffee, 
  Tag, 
  Utensils, 
  Home,
  BarChart,
  Users,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/admin' 
    },
    { 
      id: 'cardapio', 
      label: 'Cardápio', 
      icon: Coffee, 
      path: '/admin/cardapio' 
    },
    { 
      id: 'categorias', 
      label: 'Categorias', 
      icon: Tag, 
      path: '/admin/categorias' 
    },
    { 
      id: 'cozinha', 
      label: 'Painel da Cozinha', 
      icon: Utensils, 
      path: '/admin/cozinha' 
    },
    { 
      id: 'pedidos', 
      label: 'Pedidos', 
      icon: BarChart, 
      path: '/admin/pedidos' 
    },
    { 
      id: 'clientes', 
      label: 'Clientes', 
      icon: Users, 
      path: '/admin/clientes' 
    },
    { 
      id: 'configuracoes', 
      label: 'Configurações', 
      icon: Settings, 
      path: '/admin/configuracoes' 
    },
  ];

  // Verifica se um item está ativo
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-gray-800/80 backdrop-blur-sm border-r border-gray-700 min-h-[calc(100vh-73px)]">
      <nav className="p-4">
        <div className="mb-6 p-3 bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Menu Principal</p>
          <h2 className="text-sm font-medium text-white">Administração</h2>
        </div>
        
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-gradient-to-r from-[#e58840] to-[#e58840]/90 text-[#400b0b] font-bold shadow-lg shadow-[#e58840]/25'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#400b0b]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {active && (
                  <div className="ml-auto w-2 h-2 bg-[#400b0b] rounded-full"></div>
                )}
              </NavLink>
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
  );
};

export default Sidebar;