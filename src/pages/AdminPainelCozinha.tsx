import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { saveProductToSheet, deleteProductFromSheet } from '../services/adminService';

const PainelCozinha: React.FC = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'delivery' | 'retirada' | 'local'>('todos');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(false);
  const [ultimoPedidoId, setUltimoPedidoId] = useState<string>('');
  const [pedidoProcessando, setPedidoProcessando] = useState<string | null>(null); // NOVO: estado para pedido em processamento
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // URL do som MP3
  const SOUND_URL = 'https://res.cloudinary.com/dm5scqxho/video/upload/v1764645910/bell-2-123742_zbh9hp.mp3';
  
  // Inicializar áudio
  useEffect(() => {
    const audio = new Audio(SOUND_URL);
    audio.volume = 0.7;
    audio.preload = 'auto';
    audioRef.current = audio;
    
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
  
  // Efeito para piscar título
  useEffect(() => {
    if (notificacaoAtiva) {
      const originalTitle = document.title;
      let blinkInterval: NodeJS.Timeout;
      
      setTimeout(() => {
        let blinkOn = false;
        blinkInterval = setInterval(() => {
          document.title = blinkOn ? '[🔔 NOVO PEDIDO!]' : 'Painel Cozinha';
          blinkOn = !blinkOn;
        }, 800);
      }, 1000);
      
      return () => {
        if (blinkInterval) clearInterval(blinkInterval);
        document.title = originalTitle;
      };
    }
  }, [notificacaoAtiva]);
  
  // Função para tocar som
  const tocarSomNotificacao = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('Erro ao tocar som:', error);
        const fallbackAudio = new Audio(SOUND_URL);
        fallbackAudio.volume = 0.7;
        fallbackAudio.play();
      });
    }
  };
  
  // Parar notificação
  const pararNotificacao = () => {
    setNotificacaoAtiva(false);
    document.title = 'Painel Cozinha';
  };
  
  // Buscar pedidos
  const buscarPedidos = async () => {
    try {
      console.log('🔄 Buscando pedidos...');
      
      const response = await fetch(`/api?action=getPedidos&_=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 API respondeu com', data.pedidos?.length || 0, 'pedidos');
      
      if (data.success && Array.isArray(data.pedidos)) {
        const novosPedidos = data.pedidos || [];
        
        if (novosPedidos.length > 0) {
          // Ordenar por data (mais recente primeiro)
          const pedidosOrdenados = [...novosPedidos].sort((a, b) => {
            const timeA = new Date(a.timestamp || a.data || 0).getTime();
            const timeB = new Date(b.timestamp || b.data || 0).getTime();
            return timeB - timeA;
          });
          
          // Pegar o pedido MAIS RECENTE
          const pedidoMaisRecente = pedidosOrdenados[0];
          const pedidoIdMaisRecente = pedidoMaisRecente?.pedido_id || pedidoMaisRecente?.id;
          
          // DETECÇÃO DE NOVO PEDIDO (somente para pedidos com status "Recebido")
          if (pedidoIdMaisRecente && 
              pedidoIdMaisRecente !== ultimoPedidoId && 
              pedidoMaisRecente.status === 'Recebido') {
            
            console.log('🚨 NOVO PEDIDO DETECTADO!', pedidoIdMaisRecente);
            
            // 1. Tocar som
            tocarSomNotificacao();
            
            // 2. Mostrar notificação visual
            setNotificacaoAtiva(true);
            
            // 3. Notificação do navegador
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`🎉 Novo Pedido #${pedidoIdMaisRecente}`, {
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
      }
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Atualizar status - VERSÃO FINAL (usa a API atualizada)
  const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
    try {
      console.log('📝 Atualizando status:', pedidoId, '->', novoStatus);
      
      // Marcar que este pedido está sendo processado
      setPedidoProcessando(pedidoId);
      
      // Parar notificação quando mudar status
      pararNotificacao();
      
      // Chamar a NOVA API que criamos
      const response = await fetch('/api?action=atualizarStatus', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          pedidoId: pedidoId.toString().trim(),
          novoStatus: novoStatus.trim()
        })
      });
      
      const data = await response.json();
      console.log('📊 Resposta da API:', data);
      
      if (data.success || response.ok) {
        console.log('✅ Status atualizado com sucesso');
        // Recarregar pedidos para atualizar a interface
        await buscarPedidos();
      } else {
        console.error('❌ Erro:', data.error || data.erro || data.message);
        alert('Erro: ' + (data.error || data.erro || 'Não foi possível atualizar'));
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      alert('Erro de conexão');
    } finally {
      // Remover o indicador de processamento
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
  }, []);
  
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
  
  // Função para processar itens (JSON string ou array)
  const processarItens = (itens: any): any[] => {
    if (!itens) return [];
    
    try {
      // Se for string JSON, parsear
      if (typeof itens === 'string') {
        const parsed = JSON.parse(itens);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [];
      }
      
      // Se já for array, retornar
      if (Array.isArray(itens)) {
        return itens;
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao processar itens:', error);
      return [];
    }
  };
  
  // Renderizar itens do pedido - CORRIGIDA
  const renderItens = (itens: any) => {
    const itensProcessados = processarItens(itens);
    
    if (itensProcessados.length === 0) {
      return <p className="text-gray-400 text-sm">Sem itens</p>;
    }
    
    return (
      <div className="space-y-2">
        {itensProcessados.slice(0, 4).map((item: any, index: number) => {
          // Extrair valores corretamente (seus dados vem assim):
          // {
          //   "produto_id":"prod001",
          //   "nome":"Espresso Clássico",
          //   "quantidade":1,
          //   "precoUnitario":5.5,
          //   "precoTotal":5.5,
          //   "opcoes":["Pequeno"]
          // }
          
          const quantidade = parseInt(item.quantidade) || 1;
          const precoUnitario = parseFloat(item.precoUnitario) || parseFloat(item.preco) || 0;
          const precoTotal = parseFloat(item.precoTotal) || quantidade * precoUnitario;
          const nome = item.nome || item.produto || 'Item';
          const opcoes = item.opcoes || item.opcoesSelecionadas || [];
          
          return (
            <div key={index} className="text-sm border-b border-gray-700/50 pb-2 last:border-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-300">
                    {quantidade}x {nome}
                  </div>
                  
                  {/* Mostrar opções se existirem */}
                  {Array.isArray(opcoes) && opcoes.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                      {opcoes.map((opcao: string, i: number) => (
                        <div key={i}>• {opcao}</div>
                      ))}
                    </div>
                  )}
                  
                  {/* Mostrar observação se existir */}
                  {item.observacao && (
                    <div className="text-xs text-yellow-400 mt-1 italic">
                      Obs: {item.observacao}
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-2 min-w-[80px]">
                  <div className="font-medium text-white">
                    R$ {precoTotal.toFixed(2)}
                  </div>
                  {precoUnitario > 0 && (
                    <div className="text-xs text-gray-400">
                      (R$ {precoUnitario.toFixed(2)} un.)
                    </div>
                  )}
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
  
  // Calcular total do pedido - CORRIGIDA
  const calcularTotalPedido = (pedido: any) => {
    // Primeiro tentar usar o total direto
    if (pedido.total) {
      return parseFloat(pedido.total);
    }
    
    // Calcular a partir dos itens
    const itensProcessados = processarItens(pedido.itens);
    if (itensProcessados.length > 0) {
      return itensProcessados.reduce((total: number, item: any) => {
        const quantidade = parseInt(item.quantidade) || 1;
        const precoUnitario = parseFloat(item.precoUnitario) || parseFloat(item.preco) || 0;
        const precoTotal = parseFloat(item.precoTotal) || quantidade * precoUnitario;
        return total + precoTotal;
      }, 0);
    }
    
    return 0;
  };
  
  // Funções auxiliares para ícones e estilos
  const getTipoIcone = (tipo: string) => {
    switch(tipo) {
      case 'delivery': return '🏍️';
      case 'retirada': return '🤚';
      case 'local': return '☕';
      default: return '📦';
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
  if (loading) {
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
      {/* NOTIFICAÇÃO DE NOVO PEDIDO */}
      {notificacaoAtiva && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-xl shadow-2xl max-w-lg border-2 border-yellow-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🔔</div>
                <div>
                  <h3 className="font-bold text-lg">NOVO PEDIDO RECEBIDO!</h3>
                  <p className="text-sm opacity-90">Verifique na lista abaixo</p>
                </div>
              </div>
              <button 
                onClick={pararNotificacao}
                className="text-white hover:text-yellow-300 text-xl ml-4"
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
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
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
                <span>{aba.id === 'delivery' ? '🏍️' : aba.id === 'retirada' ? '🤚' : '📋'}</span>
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
            const itensProcessados = processarItens(pedido.itens);
            const totalItens = itensProcessados.reduce((total, item) => total + (parseInt(item.quantidade) || 1), 0);
            const estaProcessando = pedidoProcessando === pedidoId; // NOVO: verifica se está processando
            
            return (
              <div
                key={pedidoId}
                className={`bg-gray-800 rounded-xl border-l-4 ${tipoCor} p-4 space-y-4 ${
                  pedido.status === 'Recebido' ? 'ring-2 ring-yellow-500/50 animate-pulse' : ''
                } ${estaProcessando ? 'ring-2 ring-blue-500' : ''}`} // NOVO: destaque quando processando
              >
                {/* CABEÇALHO DO PEDIDO */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xl">{getTipoIcone(pedido.tipo)}</span>
                      <span className={`font-bold ${tipoTextCor}`}>
                        {getTipoLabel(pedido.tipo)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">#{pedidoId}</h3>
                    <p className="text-gray-400 text-sm">
                      ⏰ {formatarData(pedido.timestamp || pedido.data)}
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusCor}`}>
                    {pedido.status || 'Recebido'}
                  </div>
                </div>
                
                {/* INFORMAÇÕES DO CLIENTE */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="mb-2">
                    <p className="font-medium truncate">👤 {pedido.cliente || 'Cliente'}</p>
                    {pedido.telefone && (
                      <p className="text-gray-400 text-sm">
                        📱 {pedido.telefone}
                      </p>
                    )}
                  </div>
                  
                  {pedido.tipo === 'delivery' && pedido.endereco && (
                    <p className="text-gray-400 text-sm mt-2 truncate">
                      📍 {pedido.endereco}, {pedido.numero}
                      {pedido.complemento && ` - ${pedido.complemento}`}
                    </p>
                  )}
                  
                  {pedido.tipo === 'local' && pedido.comandaNumero && (
                    <p className="text-gray-400 text-sm mt-2">
                      🏷️ Comanda #{pedido.comandaNumero}
                    </p>
                  )}
                </div>
                
                {/* ITENS DO PEDIDO */}
                <div>
                  <h4 className="font-medium mb-2">📦 Itens do Pedido ({totalItens} itens)</h4>
                  {renderItens(pedido.itens)}
                  
                  {pedido.observacoes && (
                    <div className="mt-3 p-2 bg-yellow-900/20 rounded border border-yellow-800/30">
                      <p className="text-yellow-400 text-sm font-medium">📝 Observação:</p>
                      <p className="text-yellow-300/80 text-sm">{pedido.observacoes}</p>
                    </div>
                  )}
                </div>
                
                {/* TOTAL E AÇÕES */}
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
                              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      
      {/* RODAPÉ */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>Painel da Cozinha • Atualiza automaticamente a cada 10 segundos</p>
          <p className="mt-1">
            Último ID: {ultimoPedidoId} • 
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