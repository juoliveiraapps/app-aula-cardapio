// src/pages/PainelCozinha.tsx - VERSÃO CORRIGIDA
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminPainelCozinha: React.FC = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'delivery' | 'retirada' | 'local'>('todos');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(false);
  const [ultimoPedidoId, setUltimoPedidoId] = useState<string>('');
  const [pedidoProcessando, setPedidoProcessando] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Obter variáveis de ambiente
  const getEnvVar = () => {
    // Em desenvolvimento
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return {
        googleScriptUrl: import.meta.env.VITE_GOOGLE_SCRIPT_URL || '',
        apiKey: import.meta.env.VITE_API_KEY || ''
      };
    }
    
    // Em produção (Vercel)
    if (typeof process !== 'undefined' && process.env) {
      return {
        googleScriptUrl: process.env.VITE_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL || '',
        apiKey: process.env.VITE_API_KEY || process.env.API_KEY || ''
      };
    }
    
    return { googleScriptUrl: '', apiKey: '' };
  };
  
  const { googleScriptUrl, apiKey } = getEnvVar();
  
  // Verificar se tem as variáveis necessárias
  useEffect(() => {
    if (!googleScriptUrl || !apiKey) {
      console.error('❌ Variáveis de ambiente não configuradas!');
      console.error('Google Script URL:', googleScriptUrl ? 'OK' : 'FALTANDO');
      console.error('API Key:', apiKey ? 'OK' : 'FALTANDO');
      alert('Erro de configuração: Variáveis de ambiente não configuradas');
    }
  }, [googleScriptUrl, apiKey]);
  
  // Buscar pedidos - VERSÃO CORRIGIDA
  const buscarPedidos = async () => {
    try {
      console.log('🔄 Buscando pedidos...');
      
      if (!googleScriptUrl || !apiKey) {
        throw new Error('Variáveis de ambiente não configuradas');
      }
      
      const url = `${googleScriptUrl}?action=getPedidos&key=${apiKey}`;
      console.log('🔗 URL da API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      console.log('📊 Status da resposta:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('📦 Resposta bruta:', responseText.substring(0, 200) + '...');
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('❌ Erro ao parsear JSON:', jsonError);
        throw new Error('Resposta da API não é JSON válido');
      }
      
      console.log('📊 Dados processados:', {
        success: data.success,
        total: data.total,
        pedidosCount: data.pedidos?.length || 0
      });
      
      if (data.success && Array.isArray(data.pedidos)) {
        const novosPedidos = data.pedidos || [];
        
        if (novosPedidos.length > 0) {
          // Ordenar por data (mais recente primeiro)
          const pedidosOrdenados = [...novosPedidos].sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeB - timeA;
          });
          
          // Pegar o pedido MAIS RECENTE
          const pedidoMaisRecente = pedidosOrdenados[0];
          const pedidoIdMaisRecente = pedidoMaisRecente?.pedido_id;
          
          // DETECÇÃO DE NOVO PEDIDO (somente para pedidos com status "Recebido")
          if (pedidoIdMaisRecente && 
              pedidoIdMaisRecente !== ultimoPedidoId && 
              pedidoMaisRecente.status === 'Recebido') {
            
            console.log('🚨 NOVO PEDIDO DETECTADO!', pedidoIdMaisRecente);
            
            // 1. Mostrar notificação visual
            setNotificacaoAtiva(true);
            
            // 2. Notificação do navegador
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Novo Pedido #${pedidoIdMaisRecente}`, {
                body: `${pedidoMaisRecente.cliente || 'Cliente'} - ${pedidoMaisRecente.tipo || 'local'}`,
                icon: '/logo-cardapio.png',
                tag: `pedido-${pedidoIdMaisRecente}`
              });
            }
            
            // Atualizar último ID
            setUltimoPedidoId(pedidoIdMaisRecente);
            
            // Notificação automática some após 10 segundos
            setTimeout(() => {
              setNotificacaoAtiva(false);
            }, 10000);
          }
          
          // Se o pedido mais recente NÃO é "Recebido", parar notificação
          if (pedidoMaisRecente.status !== 'Recebido' && notificacaoAtiva) {
            setNotificacaoAtiva(false);
          }
          
          // Atualizar estado dos pedidos
          setPedidos(pedidosOrdenados);
        } else {
          // Sem pedidos
          setPedidos([]);
        }
        
        // Atualizar hora da última atualização
        setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }));
      } else {
        console.error('❌ Formato de resposta inválido:', data);
        setPedidos([]);
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar pedidos:', error.message);
      console.error('Stack:', error.stack);
      
      // Fallback: Tentar usar endpoint local /api
      try {
        console.log('🔄 Tentando fallback para /api endpoint...');
        const fallbackResponse = await fetch(`/api?action=getPedidos&_=${Date.now()}`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success && Array.isArray(fallbackData.pedidos)) {
            setPedidos(fallbackData.pedidos);
            console.log('✅ Fallback funcionou:', fallbackData.pedidos.length, 'pedidos');
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Atualizar status - VERSÃO CORRIGIDA
  const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
    if (!googleScriptUrl || !apiKey) {
      alert('Erro: Variáveis de ambiente não configuradas');
      return;
    }
    
    try {
      console.log('📝 Atualizando status:', pedidoId, '->', novoStatus);
      
      // Marcar pedido como processando
      setPedidoProcessando(pedidoId);
      
      // Parar notificação quando mudar status
      setNotificacaoAtiva(false);
      
      // Chamar API direto do Google Script
      const url = `${googleScriptUrl}?action=atualizarStatus&key=${apiKey}`;
      
      console.log('🔗 URL da atualização:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          pedidoId: pedidoId.toString().trim(),
          novoStatus: novoStatus.trim()
        }),
        mode: 'cors'
      });
      
      console.log('📊 Status da atualização:', response.status);
      
      if (response.ok) {
        console.log('✅ Status atualizado com sucesso');
        // Aguardar um pouco e recarregar
        await new Promise(resolve => setTimeout(resolve, 1000));
        await buscarPedidos();
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        alert('Erro ao atualizar status: ' + errorText.substring(0, 100));
      }
    } catch (error: any) {
      console.error('❌ Erro na requisição:', error.message);
      alert('Erro de conexão: ' + error.message);
    } finally {
      setPedidoProcessando(null);
    }
  };
  
  // Atualização automática a cada 10 segundos
  useEffect(() => {
    // Buscar imediatamente
    buscarPedidos();
    
    // Configurar intervalo
    const intervalId = setInterval(buscarPedidos, 10000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [googleScriptUrl, apiKey]); // Dependência nas variáveis de ambiente
  
  // Filtrar pedidos por aba ativa
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (abaAtiva === 'todos') return true;
    return pedido.tipo === abaAtiva;
  });
  
  // Formatar data para exibição
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
  
  // Renderizar itens do pedido
  const renderItens = (itens: any) => {
    if (!itens) return <p className="text-gray-400">Sem itens</p>;
    
    if (Array.isArray(itens)) {
      return (
        <div className="space-y-2">
          {itens.slice(0, 4).map((item: any, index: number) => {
            const quantidade = parseInt(item.quantidade) || 1;
            const precoUnitario = parseFloat(item.precoUnitario) || parseFloat(item.preco) || 0;
            const precoTotal = parseFloat(item.precoTotal) || quantidade * precoUnitario;
            
            return (
              <div key={index} className="text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-medium">{quantidade}x</span>
                    <span className="ml-2">{item.nome || item.produto || 'Item'}</span>
                    {item.opcoes && Array.isArray(item.opcoes) && item.opcoes.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {item.opcoes.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-2 min-w-[80px]">
                    <div className="font-medium">
                      R$ {precoTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {itens.length > 4 && (
            <p className="text-xs text-gray-500">+ {itens.length - 4} itens...</p>
          )}
        </div>
      );
    }
    
    return <p className="text-gray-400 text-sm">Formato de itens inválido</p>;
  };
  
  // Calcular total do pedido
  const calcularTotalPedido = (pedido: any) => {
    if (pedido.total) {
      return parseFloat(pedido.total);
    }
    
    return 0;
  };
  
  // Funções auxiliares para estilos (sem emojis)
  const getTipoLabel = (tipo: string) => {
    switch(tipo) {
      case 'delivery': return 'Delivery';
      case 'retirada': return 'Retirada';
      case 'local': return 'Consumo Local';
      default: return tipo;
    }
  };
  
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
  
  // Tela de loading
  if (loading && pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando pedidos...</p>
          {(!googleScriptUrl || !apiKey) && (
            <p className="text-yellow-400 text-sm mt-2">
              Verificando configuração da API...
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* NOTIFICAÇÃO DE NOVO PEDIDO */}
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
      
      {/* CABEÇALHO */}
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
          
          <div className="flex items-center space-x-2">
            <button
              onClick={buscarPedidos}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <span>↻</span>
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto p-4">
        {/* ABAS DE FILTRO */}
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
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
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
        
        {/* LISTA DE PEDIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidosFiltrados.map((pedido, index) => {
            const tipoCor = getTipoClass(pedido.tipo);
            const tipoTextCor = getTipoTextClass(pedido.tipo);
            const statusCor = getStatusClass(pedido.status || 'Recebido');
            const totalPedido = calcularTotalPedido(pedido);
            const pedidoId = pedido.pedido_id || pedido.id || `PED${index}`;
            const estaProcessando = pedidoProcessando === pedidoId;
            
            return (
              <div
                key={pedidoId}
                className={`bg-gray-800 rounded-xl border-l-4 ${tipoCor} p-4 space-y-4 ${
                  pedido.status === 'Recebido' ? 'ring-2 ring-yellow-500/50' : ''
                } ${estaProcessando ? 'ring-2 ring-blue-500' : ''}`}
              >
                {/* CABEÇALHO DO PEDIDO */}
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
                
                {/* INFORMAÇÕES DO CLIENTE */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="mb-2">
                    <p className="font-medium truncate">{pedido.cliente || 'Cliente'}</p>
                    {pedido.telefone && pedido.telefone !== 'Não informado' && (
                      <p className="text-gray-400 text-sm">
                        {pedido.telefone}
                      </p>
                    )}
                  </div>
                  
                  {pedido.tipo === 'delivery' && pedido.endereco && (
                    <p className="text-gray-400 text-sm mt-2 truncate">
                      {pedido.endereco}
                      {pedido.numero && `, ${pedido.numero}`}
                      {pedido.complemento && ` - ${pedido.complemento}`}
                    </p>
                  )}
                </div>
                
                {/* ITENS DO PEDIDO */}
                <div>
                  <h4 className="font-medium mb-2">Itens do Pedido</h4>
                  {renderItens(pedido.itens)}
                </div>
                
                {/* TOTAL E AÇÕES */}
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
        
        {/* MENSAGEM PARA LISTA VAZIA */}
        {pedidosFiltrados.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Nenhum pedido {abaAtiva !== 'todos' ? `de ${abaAtiva}` : ''}
            </h3>
            <p className="text-gray-500">
              Os pedidos aparecerão aqui automaticamente quando forem feitos.
            </p>
          </div>
        )}
      </div>
      
      {/* RODAPÉ */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>Painel da Cozinha • Atualiza automaticamente a cada 10 segundos</p>
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