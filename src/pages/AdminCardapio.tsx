import React, { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import ProductForm from '../components/admin/ProductForm';
import ProductList from '../components/admin/ProductList';

const AdminCardapio = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produtos..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-600 rounded-lg bg-gray-900/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtrar</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {showForm ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Cadastrar Novo Produto</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
          <ProductForm onSuccess={() => setShowForm(false)} />
        </div>
      ) : (
        <>
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Produtos</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 font-bold">📦</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Disponíveis</p>
                  <p className="text-2xl font-bold text-white">22</p>
                </div>
                <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-green-400 font-bold">✅</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Indisponíveis</p>
                  <p className="text-2xl font-bold text-white">2</p>
                </div>
                <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-red-400 font-bold">⏸️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Produtos */}
          <div className="mt-6">
            <ProductList />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCardapio;