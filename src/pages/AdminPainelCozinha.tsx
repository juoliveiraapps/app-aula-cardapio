import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PainelCozinha: React.FC = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'delivery' | 'retirada' | 'local'>('todos');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(false);
  const [ultimoPedidoId, setUltimoPedidoId] = useState<string>('');
  const [pedidoProcessando, setPedidoProcessando] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const API_KEY = "cce4d5770afe09d2c790dcca4272e1190462a6a574270b040c835889115c6914";
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrEMAZ9jap-LMpi5_VrlZsVvpGyBwNzL6YAVPeG06ZSQDNsb7sIuj5UsWF2x4xzZt8MA/exec";
  
  // Inicializar áudio
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Buscar pedidos
  const buscarPedidos = async () => {
    try {
      setLoading(true);
      
      const url = `${GOOGLE_SCRIPT_URL}?action=getPedidos&key=${API_KEY}`;
      console.log('🔗 Buscando pedidos:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        headers: {
          'Accept': 'application/json',
        }
      }).catch(error => {
        console.error('❌ Erro de fetch:', error);
        throw new Error(`Falha na conexão: ${error.message}`);
      });
      
      console.log('📨 Response:', response);
      
      // Como estamos usando no-cors, não podemos ler a resposta diretamente
      // Mas podemos assumir que a requisição foi feita
      // Em vez disso, faremos uma nova requisição usando o endpoint da API local
      const apiResponse = await fetch(`/api?action=getPedidos&_=${Date.now()}`);
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP ${apiResponse.status}`);
      }
      
      const data = await apiResponse.json();
      console.log('📊 Dados recebidos:', data);
      
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
            
            console.log('🚨 NOVO PEDIDO DETECTADO!', pedidoIdMaisRecente);
            setNotificacaoAtiva(true);
            setUltimoPedidoId(pedidoIdMaisRecente);
            
            setTimeout(() => {
              setNotificacaoAtiva(false);
            }, 10000);
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
  
  // Atualizar status
  const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
    try {
      console.log('📝 Atualizando status:', pedidoId, '->', novoStatus);
      
      setPedidoProcessando(pedidoId);
      
      const url = `${GOOGLE_SCRIPT_URL}?action=atualizarStatus&key=${API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pedidoId: pedidoId.toString().trim(),
          novoStatus: novoStatus.trim()
        })
      }).catch(error => {
        console.error('❌ Erro de fetch:', error);
        throw new Error(`Falha na conexão: ${error.message}`);
      });
      
      console.log('📨 Status atualizado, response:', response);
      
      // Aguardar um pouco e recarregar
      await new Promise(resolve => setTimeout(resolve, 1500));
      await buscarPedidos();
      
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      alert('Erro ao atualizar status');
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
  
  // Processar itens
  const processarItens = (itens: any): any[] => {
    if (!itens) return [];
    
    try {
      if (Array.isArray(itens)) {
        return itens;
      }
      return [];
    } catch (error) {
      console.error('Erro ao processar itens:', error);
      return [];
    }
  };
  
  // Renderizar itens
  const renderItens = (itens: any) => {
    const itensProcessados = processarItens(itens);
    
    if (itensProcessados.length === 0) {
      return <p className="text-gray-400 text-sm">Sem itens</p>;
    }
    
    return (
      <div className="space-y-2">
        {itensProcessados.slice(0, 4).map((item: any, index: number) => {
          const quantidade = parseInt(item.quantidade) || 1;
          const precoUnitario = parseFloat(item.precoUnitario) || 0;
          const precoTotal = parseFloat(item.precoTotal) || quantidade * precoUnitario;
          const nome = item.nome || 'Item';
          const opcoes = item.opcoes || [];
          
          return (
            <div key={index} className="text-sm border-b border-gray-700/50 pb-2 last:border-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-300">
                    {quantidade}x {nome}
                  </div>
                  
                  {Array.isArray(opcoes) && opcoes.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                      {opcoes.map((opcao: string, i: number) => (
                        <div key={i}>{opcao}</div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-2 min-w-[80px]">
                  <div className="font-medium text-white">
                    R$ {precoTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {itensProcessados.length > 4 && (
          <p className="text-xs text-gray-500 pt-2">
            + {itensProcessados.length - 4} itens...
          </p>
        )}
      </div>
    );
  };
  
  // Calcular total
  const calcularTotalPedido = (pedido: any) => {
    if (pedido.total) {
      return parseFloat(pedido.total);
    }
    
    const itensProcessados = processarItens(pedido.itens);
    if (itensProcessados.length > 0) {
      return itensProcessados.reduce((total: number, item: any) => {
        const quantidade = parseInt(item.quantidade) || 1;
        const precoUnitario = parseFloat(item.precoUnitario) || 0;
        const precoTotal = parseFloat(item.precoTotal) || quantidade * precoUnitario;
        return total + precoTotal;
      }, 0);
    }
    
    return 0;
  };
  
  // Funções auxiliares
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
  
  const getTipoTextClass = (tipo: string) => {
    switch(tipo) {
      case 'delivery': return 'text-blue-400';
      case 'retirada': return 'text-green-400';
      case 'local': return 'text-purple-400';
      default: return 'text-gray-400';
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
                <div className="text-2xl">🔔</div>
                <div>
                  <h3 className="font-bold text-lg">NOVO PEDIDO RECEBIDO!</h3>
                  <p className="text-sm">Verifique na lista abaixo</p>
                </div>
              </div>
              <button 
                onClick={() => setNotificacaoAtiva(false)}
                className="text-white hover:text-yellow-300 text-xl"
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
          <div>
            <h1 className="text-2xl font-bold">Painel da Cozinha</h1>
            <p className="text-gray-400 text-sm">
              Atualizado: {ultimaAtualizacao} | {pedidos.length} pedidos
            </p>
          </div>
          
          <div>
            <button
              onClick={buscarPedidos}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
      </header>
      
      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Abas */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'todos', label: 'Todos', count: pedidos.length },
            { id: 'delivery', label: 'Delivery', count: pedidos.filter(p => p.tipo === 'delivery').length },
            { id: 'retirada', label: 'Retirada', count: pedidos.filter(p => p.tipo === 'retirada').length },
            { id: 'local', label: 'Local', count: pedidos.filter(p => p.tipo === 'local').length }
          ].map((aba) => {
            const isAtiva = abaAtiva === aba.id;
            
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isAtiva
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="font-medium">{aba.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isAtiva ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {aba.count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Lista de Pedidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidosFiltrados.map((pedido, index) => {
            const tipoCor = getTipoClass(pedido.tipo);
            const tipoTextCor = getTipoTextClass(pedido.tipo);
            const statusCor = getStatusClass(pedido.status || 'Recebido');
            const totalPedido = calcularTotalPedido(pedido);
            const pedidoId = pedido.pedido_id || pedido.id || `PED${index}`;
            const itensProcessados = processarItens(pedido.itens);
            const totalItens = itensProcessados.reduce((total, item) => total + (parseInt(item.quantidade) || 1), 0);
            const estaProcessando = pedidoProcessando === pedidoId;
            
            return (
              <div
                key={pedidoId}
                className={`bg-gray-800 rounded-xl border-l-4 ${tipoCor} p-4 space-y-4 ${
                  pedido.status === 'Recebido' ? 'ring-2 ring-yellow-500/50' : ''
                } ${estaProcessando ? 'ring-2 ring-blue-500' : ''}`}
              >
                {/* Cabeçalho */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="mb-1">
                      <span className={`font-bold ${tipoTextCor}`}>
                        {getTipoLabel(pedido.tipo)}
                      </span>
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
                  <div className="mb-2">
                    <p className="font-medium">{pedido.cliente || 'Cliente'}</p>
                    {pedido.telefone && pedido.telefone !== 'Não informado' && (
                      <p className="text-gray-400 text-sm">
                        {pedido.telefone}
                      </p>
                    )}
                  </div>
                  
                  {pedido.tipo === 'delivery' && pedido.endereco && (
                    <p className="text-gray-400 text-sm mt-2">
                      {pedido.endereco}
                    </p>
                  )}
                </div>
                
                {/* Itens */}
                <div>
                  <h4 className="font-medium mb-2">Itens do Pedido ({totalItens} itens)</h4>
                  {renderItens(pedido.itens)}
                </div>
                
                {/* Total e Ações */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold">
                        R$ {totalPedido.toFixed(2)}
                      </span>
                      <div className="text-xs text-gray-400">
                        {totalItens} itens
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {pedido.status === 'Recebido' && (
                        <button
                          onClick={() => !estaProcessando && atualizarStatus(pedidoId, 'Preparando')}
                          disabled={estaProcessando}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center min-w-[90px] ${
                            estaProcessando
                              ? 'bg-orange-700 cursor-not-allowed'
                              : 'bg-orange-600 hover:bg-orange-700'
                          }`}
                        >
                          {estaProcessando ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processando...
                            </>
                          ) : 'Preparar'}
                        </button>
                      )}
                      
                      {pedido.status === 'Preparando' && (
                        <button
                          onClick={() => !estaProcessando && atualizarStatus(pedidoId, 'Pronto')}
                          disabled={estaProcessando}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center min-w-[90px] ${
                            estaProcessando
                              ? 'bg-teal-700 cursor-not-allowed'
                              : 'bg-teal-600 hover:bg-teal-700'
                          }`}
                        >
                          {estaProcessando ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processando...
                            </>
                          ) : 'Pronto'}
                        </button>
                      )}
                      
                      {pedido.status === 'Pronto' && (
                        <button
                          onClick={() => !estaProcessando && atualizarStatus(pedidoId, 'Entregue')}
                          disabled={estaProcessando}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center min-w-[90px] ${
                            estaProcessando
                              ? 'bg-gray-700 cursor-not-allowed'
                              : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {estaProcessando ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processando...
                            </>
                          ) : 'Entregue'}
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
        {pedidosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Nenhum pedido {abaAtiva !== 'todos' ? `de ${abaAtiva}` : ''}
            </h3>
            <p className="text-gray-500">
              Os pedidos aparecerão aqui automaticamente quando forem feitos.
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

export default PainelCozinha;