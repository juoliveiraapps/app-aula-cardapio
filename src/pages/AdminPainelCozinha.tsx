// src/pages/PainelCozinha.tsx - VERSÃO COM STATUS FUNCIONAL
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminPainelCozinha: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'delivery' | 'retirada' | 'local'>('todos');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(false);
  const [ultimoPedidoId, setUltimoPedidoId] = useState<string>('');
  const [pedidoProcessando, setPedidoProcessando] = useState<string | null>(null);

  // Construir URL da API - compatível com .env.local
  const getApiUrl = (action: string) => {
    // Desenvolvimento: usa proxy local
    // Produção: usa variáveis de ambiente
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
    
    if (isDev) {
      return `/api?action=${action}`;
    }
    
    // Usar variáveis de ambiente (Vite)
    const apiKey = import.meta.env.VITE_API_KEY || '';
    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
    
    if (!apiKey || !scriptUrl) {
      console.error('Variáveis de ambiente VITE_API_KEY ou VITE_GOOGLE_SCRIPT_URL não configuradas');
      return `/api?action=${action}`; // Fallback para proxy
    }
    
    return `${scriptUrl}?action=${action}&key=${apiKey}`;
  };

  // Buscar pedidos - VERSÃO SIMPLIFICADA
  const buscarPedidos = async () => {
    try {
      setLoading(true);
      
      const url = getApiUrl('getPedidos');
      console.log('🔗 Buscando pedidos de:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Pedidos recebidos:', data.pedidos?.length || 0);
      
      if (data.success && Array.isArray(data.pedidos)) {
        const pedidosOrdenados = [...data.pedidos].sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeB - timeA;
        });
        
        // Detectar novo pedido
        if (pedidosOrdenados.length > 0) {
          const pedidoMaisRecente = pedidosOrdenados[0];
          const pedidoIdMaisRecente = pedidoMaisRecente?.pedido_id;
          
          if (pedidoIdMaisRecente && 
              pedidoIdMaisRecente !== ultimoPedidoId && 
              pedidoMaisRecente.status === 'Recebido') {
            
            console.log('🚨 Novo pedido detectado:', pedidoIdMaisRecente);
            setNotificacaoAtiva(true);
            setUltimoPedidoId(pedidoIdMaisRecente);
            
            // Notificação do navegador
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Novo Pedido #${pedidoIdMaisRecente}`, {
                body: `${pedidoMaisRecente.cliente || 'Cliente'}`,
                icon: '/logo-cardapio.png'
              });
            }
            
            setTimeout(() => setNotificacaoAtiva(false), 10000);
          }
        }
        
        setPedidos(pedidosOrdenados);
        
        setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status - VERSÃO CORRIGIDA
  const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
    try {
      console.log('📝 Atualizando status:', pedidoId, '->', novoStatus);
      
      setPedidoProcessando(pedidoId);
      setNotificacaoAtiva(false);
      
      const url = getApiUrl('atualizarStatus');
      console.log('🔗 URL de atualização:', url);
      
      // Método correto para Google Apps Script
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          pedidoId: pedidoId.trim(),
          novoStatus: novoStatus.trim()
        })
      });
      
      console.log('📊 Resposta da atualização:', response.status);
      
      if (response.ok) {
        console.log('✅ Status atualizado com sucesso');
        
        // Atualizar o pedido localmente (otimização)
        setPedidos(prevPedidos => 
          prevPedidos.map(pedido => 
            pedido.pedido_id === pedidoId 
              ? { ...pedido, status: novoStatus, atualizado_em: new Date().toISOString() }
              : pedido
          )
        );
        
        // Também buscar novamente após um delay
        setTimeout(() => buscarPedidos(), 500);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        
        // Tentar parsear como JSON
        try {
          const errorData = JSON.parse(errorText);
          alert(`Erro: ${errorData.error || errorData.message || 'Erro desconhecido'}`);
        } catch {
          alert('Erro ao atualizar status. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      alert('Erro de conexão. Verifique sua internet.');
    } finally {
      setPedidoProcessando(null);
    }
  };

  // Atualização automática
  useEffect(() => {
    buscarPedidos();
    
    const intervalId = setInterval(buscarPedidos, 10000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (abaAtiva === 'todos') return true;
    return pedido.tipo === abaAtiva;
  });

  // Formatar data
  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return 'Agora';
    }
  };

  // Renderizar itens
  const renderItens = (itens: any) => {
    if (!itens) return <p className="text-gray-400 text-sm">Sem itens</p>;
    
    if (Array.isArray(itens)) {
      return (
        <div className="space-y-2">
          {itens.slice(0, 4).map((item: any, index: number) => {
            const quantidade = parseInt(item.quantidade) || 1;
            const precoUnitario = parseFloat(item.precoUnitario) || 0;
            const precoTotal = parseFloat(item.precoTotal) || quantidade * precoUnitario;
            
            return (
              <div key={index} className="text-sm border-b border-gray-700/50 pb-2 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-300">
                      {quantidade}x {item.nome || 'Item'}
                    </div>
                    {item.opcoes && Array.isArray(item.opcoes) && item.opcoes.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {item.opcoes.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-2">
                    <div className="font-medium text-white">
                      R$ {precoTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {itens.length > 4 && (
            <p className="text-xs text-gray-500 pt-2">
              + {itens.length - 4} itens...
            </p>
          )}
        </div>
      );
    }
    
    return <p className="text-gray-400 text-sm">Formato inválido</p>;
  };

  // Estilos auxiliares
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Recebido': return 'bg-yellow-900/30 text-yellow-400';
      case 'Preparando': return 'bg-orange-900/30 text-orange-400';
      case 'Pronto': return 'bg-teal-900/30 text-teal-400';
      case 'Entregue': return 'bg-gray-700 text-gray-400';
      default: return 'bg-gray-800 text-gray-300';
    }
  };

  const getTipoClass = (tipo: string) => {
    switch(tipo) {
      case 'delivery': return 'border-blue-500';
      case 'retirada': return 'border-green-500';
      case 'local': return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch(tipo) {
      case 'delivery': return 'Delivery';
      case 'retirada': return 'Retirada';
      case 'local': return 'Consumo Local';
      default: return tipo;
    }
  };

  // Loading
  if (loading && pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Notificação */}
      {notificacaoAtiva && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-xl shadow-2xl max-w-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="font-bold text-lg">NOVO PEDIDO!</div>
              </div>
              <button 
                onClick={() => setNotificacaoAtiva(false)}
                className="text-white hover:text-yellow-300"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cabeçalho */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            
            <div>
              <h1 className="text-2xl font-bold">Painel da Cozinha</h1>
              <p className="text-gray-400 text-sm">
                Atualizado: {ultimaAtualizacao} | {pedidos.length} pedidos
              </p>
            </div>
          </div>
          
          <button
            onClick={buscarPedidos}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Atualizar
          </button>
        </div>
      </header>
      
      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Abas */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {['todos', 'delivery', 'retirada', 'local'].map((aba) => {
            const isAtiva = abaAtiva === aba;
            const count = aba === 'todos' 
              ? pedidos.length 
              : pedidos.filter(p => p.tipo === aba).length;
            
            return (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isAtiva ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="font-medium capitalize">{aba}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isAtiva ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Lista de Pedidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidosFiltrados.map((pedido, index) => {
            const tipoCor = getTipoClass(pedido.tipo);
            const statusCor = getStatusClass(pedido.status || 'Recebido');
            const totalPedido = parseFloat(pedido.total) || 0;
            const pedidoId = pedido.pedido_id || pedido.id || `PED${index}`;
            const estaProcessando = pedidoProcessando === pedidoId;
            const itensArray = Array.isArray(pedido.itens) ? pedido.itens : [];
            const totalItens = itensArray.reduce((total, item) => 
              total + (parseInt(item.quantidade) || 1), 0);
            
            return (
              <div
                key={pedidoId}
                className={`bg-gray-800 rounded-xl border-l-4 ${tipoCor} p-4 space-y-4 ${
                  pedido.status === 'Recebido' ? 'ring-2 ring-yellow-500/50' : ''
                }`}
              >
                {/* Cabeçalho */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-400 mb-1">
                      {getTipoLabel(pedido.tipo)}
                    </div>
                    <h3 className="text-xl font-bold">#{pedidoId}</h3>
                    <p className="text-gray-400 text-sm">
                      {formatarData(pedido.timestamp || pedido.data)}
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusCor}`}>
                    {pedido.status || 'Recebido'}
                  </div>
                </div>
                
                {/* Cliente */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="font-medium truncate">{pedido.cliente || 'Cliente'}</p>
                  {pedido.telefone && pedido.telefone !== 'Não informado' && (
                    <p className="text-gray-400 text-sm mt-1">
                      {pedido.telefone}
                    </p>
                  )}
                  
                  {pedido.tipo === 'delivery' && pedido.endereco && (
                    <p className="text-gray-400 text-sm mt-2 truncate">
                      {pedido.endereco}
                    </p>
                  )}
                </div>
                
                {/* Itens */}
                <div>
                  <h4 className="font-medium mb-2">Itens ({totalItens})</h4>
                  {renderItens(pedido.itens)}
                </div>
                
                {/* Total e Ações */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold">
                        R$ {totalPedido.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {pedido.status === 'Recebido' && (
                        <button
                          onClick={() => atualizarStatus(pedidoId, 'Preparando')}
                          disabled={estaProcessando}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors min-w-[90px] ${
                            estaProcessando
                              ? 'bg-orange-700 cursor-not-allowed'
                              : 'bg-orange-600 hover:bg-orange-700'
                          }`}
                        >
                          {estaProcessando ? 'Processando...' : 'Preparar'}
                        </button>
                      )}
                      
                      {pedido.status === 'Preparando' && (
                        <button
                          onClick={() => atualizarStatus(pedidoId, 'Pronto')}
                          disabled={estaProcessando}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors min-w-[90px] ${
                            estaProcessando
                              ? 'bg-teal-700 cursor-not-allowed'
                              : 'bg-teal-600 hover:bg-teal-700'
                          }`}
                        >
                          {estaProcessando ? 'Processando...' : 'Pronto'}
                        </button>
                      )}
                      
                      {pedido.status === 'Pronto' && (
                        <button
                          onClick={() => atualizarStatus(pedidoId, 'Entregue')}
                          disabled={estaProcessando}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors min-w-[90px] ${
                            estaProcessando
                              ? 'bg-gray-700 cursor-not-allowed'
                              : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {estaProcessando ? 'Processando...' : 'Entregue'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Lista Vazia */}
        {pedidosFiltrados.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Nenhum pedido {abaAtiva !== 'todos' ? `de ${abaAtiva}` : ''}
            </h3>
            <p className="text-gray-500">
              Os pedidos aparecerão aqui automaticamente.
            </p>
          </div>
        )}
      </div>
      
      {/* Rodapé */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>Painel da Cozinha • Atualiza a cada 10 segundos</p>
          <p className="mt-1">
            Recebidos: {pedidos.filter(p => p.status === 'Recebido').length} • 
            Preparando: {pedidos.filter(p => p.status === 'Preparando').length} • 
            Prontos: {pedidos.filter(p => p.status === 'Pronto').length}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminPainelCozinha;

