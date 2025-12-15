import React, { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff, Filter, Search } from 'lucide-react';

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  imagem_url?: string;
  categoria_id: string;
  categoria_nome?: string;
  disponivel: boolean;
  posicao: number;
  opcoes?: any[];
}

interface Categoria {
  id: string;
  nome: string;
}

interface ProductListProps {
  produtos: Produto[];
  categorias: Categoria[];
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
  emptyMessage?: string;
}

const ProductList: React.FC<ProductListProps> = ({
  produtos,
  categorias,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = 'Nenhum produto cadastrado'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Filtrar produtos
  const filteredProdutos = produtos.filter(produto => {
    // Filtro por busca
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por categoria
    const matchesCategory = !selectedCategory || produto.categoria_id === selectedCategory;
    
    // Filtro por disponibilidade
    const matchesAvailability = !showOnlyAvailable || produto.disponivel;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Estatísticas
  const stats = {
    total: produtos.length,
    disponiveis: produtos.filter(p => p.disponivel).length,
    comImagem: produtos.filter(p => p.imagem_url).length,
    comOpcoes: produtos.filter(p => p.opcoes && p.opcoes.length > 0).length
  };

  // Se não há produtos
  if (!loading && produtos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500">
          Comece criando seu primeiro produto para o cardápio.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton para filtros */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-800/50 rounded-lg animate-pulse">
          <div className="h-10 bg-gray-700/50 rounded flex-1"></div>
          <div className="h-10 bg-gray-700/50 rounded w-48"></div>
          <div className="h-10 bg-gray-700/50 rounded w-32"></div>
        </div>
        
        {/* Skeleton para estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-800/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        {/* Skeleton para lista */}
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-800/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por categoria */}
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
            >
              <option value="">Todas categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por disponibilidade */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-[#e58840] bg-gray-900 border-gray-700 rounded focus:ring-[#e58840] focus:ring-2"
              />
              <span className="text-gray-300 whitespace-nowrap">Apenas disponíveis</span>
            </label>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total de Produtos</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{stats.disponiveis}</div>
            <div className="text-sm text-gray-400">Disponíveis</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.comImagem}</div>
            <div className="text-sm text-gray-400">Com Imagem</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{stats.comOpcoes}</div>
            <div className="text-sm text-gray-400">Com Opções</div>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="space-y-3">
   {filteredProdutos.map((produto, index) => {
  const categoria = categorias.find(c => c.id === produto.categoria_id);
  // Use index como fallback se id for vazio
  const uniqueKey = produto.id || `produto-${index}-${Date.now()}`;
  
  return (
    <div
      key={uniqueKey} // ⬅️ CORRIGIDO
              className={`bg-gray-800/50 rounded-xl border p-4 hover:border-[#e58840]/30 transition-all duration-300 ${
                !produto.disponivel 
                  ? 'opacity-70 border-gray-700/50' 
                  : 'border-gray-700/50 hover:shadow-lg hover:shadow-[#e58840]/5'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Imagem */}
                <div className="md:w-32 flex-shrink-0">
                  {produto.imagem_url ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-900">
                      <img
                        src={produto.imagem_url}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-gray-900 flex items-center justify-center">
                      <span className="text-3xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="text-lg font-bold text-white truncate">
                          {produto.nome}
                        </h4>
                        
                        {/* Badges */}
                        <div className="flex items-center gap-1">
                          {!produto.disponivel && (
                            <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded flex items-center">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Indisponível
                            </span>
                          )}
                          
                          {produto.opcoes && produto.opcoes.length > 0 && (
                            <span className="text-xs px-2 py-1 bg-purple-900/30 text-purple-400 rounded">
                              +{produto.opcoes.length} opções
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Preço e Categoria */}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xl font-bold text-[#e58840]">
                          {formatPrice(produto.preco)}
                        </span>
                        
                        {categoria && (
                          <span className="text-sm px-3 py-1 bg-gray-900/50 text-gray-300 rounded-full">
                            {categoria.nome}
                          </span>
                        )}
                      </div>
                      
                      {/* Descrição */}
                      {produto.descricao && (
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {produto.descricao}
                        </p>
                      )}
                      
                      {/* Metadados */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-xs px-2 py-1 bg-gray-900/50 rounded text-gray-400">
                          Ordem: {produto.posicao}º
                        </span>
                        
                        <span className="text-xs text-gray-500">
                          ID: {produto.id.substring(0, 8)}...
                        </span>
                        
                        {produto.imagem_url ? (
                          <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded">
                            Com imagem
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded">
                            Sem imagem
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <button
                        onClick={() => onEdit(produto)}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-[#e58840] transition-colors hover:bg-gray-700/50 rounded-lg disabled:opacity-50"
                        title="Editar produto"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(produto.id)}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors hover:bg-gray-700/50 rounded-lg disabled:opacity-50"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Opções do produto (se houver) */}
              {produto.opcoes && produto.opcoes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/30">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Opções disponíveis:</h5>
                  <div className="flex flex-wrap gap-2">
                    {produto.opcoes.slice(0, 3).map((opcao, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-900/50 rounded text-gray-300"
                      >
                        {opcao.nome} (+{formatPrice(opcao.preco)})
                      </span>
                    ))}
                    {produto.opcoes.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
                        +{produto.opcoes.length - 3} mais...
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensagem de nenhum resultado */}
      {filteredProdutos.length === 0 && produtos.length > 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros de busca.
          </p>
        </div>
      )}

      {/* Paginação ou contador de resultados */}
      {filteredProdutos.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Mostrando <span className="font-medium text-gray-300">{filteredProdutos.length}</span> de{' '}
            <span className="font-medium text-gray-300">{produtos.length}</span> produtos
          </div>
          <div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-[#e58840] hover:text-[#e58840]/80"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;