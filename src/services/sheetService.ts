// src/services/sheetService.ts
import { ItemCarrinho, PedidoParaSheet } from '../types';

// Função para detectar URL base automaticamente
const getProxyUrl = () => {
  // Verificação SSR segura
  if (typeof window === 'undefined') return '';

  // Em desenvolvimento, usa a mesma origem (localhost:5173 com proxy do Vite)
  // Em produção, usa a origem do domínio (Vercel)
  return window.location.origin;
}

export const formatarItensParaSheet = (itens: ItemCarrinho[]) => {
  return itens.map(item => {
    const opcoesFormatadas: string[] = [];
    
    item.produto.opcoes?.forEach(grupo => {
      const opcaoId = item.opcoesSelecionadas[grupo.id];
      if (opcaoId) {
        const opcao = grupo.opcoes.find(o => o.id === opcaoId);
        if (opcao) {
          opcoesFormatadas.push(opcao.rotulo || opcao.nome);
        }
      }
    });

    const precoUnitario = item.precoTotal / item.quantidade;
    
    return {
      produto_id: item.produto.produto_id,
      nome: item.produto.nome,
      quantidade: item.quantidade,
      precoUnitario: Number(precoUnitario.toFixed(2)),
      precoTotal: Number(item.precoTotal.toFixed(2)),
      opcoes: opcoesFormatadas.length > 0 ? opcoesFormatadas : undefined,
      observacao: item.observacao || undefined
    };
  });
};

export const salvarPedidoNoSheet = async (pedido: PedidoParaSheet): Promise<any> => {
  // Proteção SSR
  if (typeof window === 'undefined') {
    return {
      success: true,
      pedido_id: 'SSR_' + Date.now(),
      message: 'Ambiente de servidor'
    };
  }

  const PROXY_URL = getProxyUrl();
  
  // Se não tiver proxy configurado, use fallback
  if (!PROXY_URL || PROXY_URL.includes('localhost')) {
    console.warn('⚠️ Modo desenvolvimento: usando fallback');
    
    return {
      success: true,
      pedido_id: 'DEV_' + Date.now(),
      message: 'Pedido simulado (modo desenvolvimento)',
      timestamp: new Date().toISOString(),
      detalhes: {
        comanda: pedido.comandaNumero || 'N/A',
        tipo: pedido.tipo,
        cliente: pedido.cliente,
        total: pedido.total
      }
    };
  }
  
  try {
    console.log('📤 Enviando pedido para API:', `${PROXY_URL}/api?action=salvarPedido`); // CORREÇÃO AQUI

    const response = await fetch(`${PROXY_URL}/api?action=salvarPedido`, { // CORREÇÃO AQUI
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json' // Adicionado para melhor compatibilidade
      },
      body: JSON.stringify(pedido)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Resposta da API:', result);
    
    return result;
    
  } catch (error: any) {
    console.error('❌ Erro ao enviar pedido:', error);
    
    return {
      success: false,
      error: error.message || 'Erro ao salvar pedido',
      message: 'Não foi possível conectar ao servidor.'
    };
  }
};

export const formatarMensagemWhatsApp = (
  itens: ItemCarrinho[],
  dados: any,
  tipoEntrega: 'local' | 'retirada' | 'delivery',
  comandaNumero?: string,
  config?: any
) => {
  const formatarOpcoesItem = (item: ItemCarrinho) => {
    const opcoes: string[] = [];
    item.produto.opcoes?.forEach(grupo => {
      const opcaoId = item.opcoesSelecionadas[grupo.id];
      if (opcaoId) {
        const opcao = grupo.opcoes.find(o => o.id === opcaoId);
        if (opcao) {
          opcoes.push(opcao.rotulo);
        }
      }
    });
    return opcoes.length > 0 ? ` (${opcoes.join(', ')})` : '';
  };

  const itensFormatados = itens.map(item => {
    const opcoes = formatarOpcoesItem(item);
    const precoUnitario = (item.precoTotal / item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `${item.quantidade}x ${item.produto.nome}${opcoes} - ${item.precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${precoUnitario} cada)`;
  }).join('\n');

  const subtotal = itens.reduce((total, item) => total + item.precoTotal, 0);
  const taxaEntrega = tipoEntrega === 'delivery' ? 5 : 0;
  const total = subtotal + taxaEntrega;

  let infoEntrega = '';
  if (tipoEntrega === 'local') {
    infoEntrega = `*Comanda:* ${comandaNumero || dados.comanda || 'Gerar automaticamente'}\n*Tipo:* Consumo no Local\n`;
  } else if (tipoEntrega === 'retirada') {
    infoEntrega = `*Tipo:* Retirada no Local\n`;
  } else {
    infoEntrega = `*Endereço:* ${dados.endereco}, ${dados.numero}${dados.complemento ? ` - ${dados.complemento}` : ''}\n*Referência:* ${dados.referencia || 'Não informada'}\n*Tipo:* Delivery\n`;
  }

  const mensagem = `*NOVO PEDIDO - ${config?.nome_loja || 'Roast Coffee'}*
    
*Cliente:* ${dados.nome}
*WhatsApp:* ${dados.telefone}
${infoEntrega}
*ITENS:*
${itensFormatados}

${dados.observacoes ? `*Observações:* ${dados.observacoes}\n` : ''}
*Forma de Pagamento:* ${dados.formaPagamento === 'dinheiro' ? 'Dinheiro' : dados.formaPagamento === 'cartao' ? 'Cartão' : 'PIX'}

*Subtotal:* ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
${tipoEntrega === 'delivery' ? `*Taxa de entrega:* R$ 5,00\n` : ''}
*TOTAL:* ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;

  return mensagem;
};

export const formatarTelefoneWhatsApp = (telefone: string): string => {
  try {
    // ⭐⭐ GARANTIR que é string e não nulo/undefined
    if (!telefone) {
      console.warn('Telefone vazio recebido');
      return '';
    }
    
    const telStr = String(telefone).trim();
    
    // Log para debug
    console.log('📞 Telefone recebido para formatar:', telStr);
    
    // Remover tudo que não é número
    const apenasNumeros = telStr.replace(/\D/g, '');
    
    if (apenasNumeros.length === 0) {
      console.warn('Nenhum número encontrado no telefone:', telStr);
      return '';
    }
    
    // ⭐⭐ LÓGICA SIMPLIFICADA E ROBUSTA
    // 1. Se já tem código do país (55) e tem 12 ou 13 dígitos, usar como está
    if (apenasNumeros.startsWith('55') && (apenasNumeros.length === 12 || apenasNumeros.length === 13)) {
      console.log('✅ Telefone já com código país:', apenasNumeros);
      return apenasNumeros;
    }
    
    // 2. Se tem 11 dígitos (0 + DDD + 9 dígitos)
    if (apenasNumeros.length === 11 && apenasNumeros.startsWith('0')) {
      const semZero = apenasNumeros.substring(1); // Remove o 0 inicial
      const resultado = '55' + semZero;
      console.log('✅ Telefone 11 dígitos (com 0):', apenasNumeros, '->', resultado);
      return resultado;
    }
    
    // 3. Se tem 11 dígitos sem 0 inicial (DDD + 9 dígitos)
    if (apenasNumeros.length === 11) {
      const resultado = '55' + apenasNumeros;
      console.log('✅ Telefone 11 dígitos (sem 0):', apenasNumeros, '->', resultado);
      return resultado;
    }
    
    // 4. Se tem 10 dígitos (DDD + 8 dígitos)
    if (apenasNumeros.length === 10) {
      const resultado = '55' + apenasNumeros;
      console.log('✅ Telefone 10 dígitos:', apenasNumeros, '->', resultado);
      return resultado;
    }
    
    // 5. Fallback: adiciona 55 e usa
    console.log('⚠️ Formato não padrão, usando fallback:', apenasNumeros);
    return '55' + apenasNumeros;
    
  } catch (error) {
    console.error('❌ Erro inesperado ao formatar telefone:', error);
    return '';
  }
};

export interface ResultadoWhatsApp {
  sucesso: boolean;
  url: string;
  popupBloqueado: boolean;
}

export const enviarParaWhatsApp = (
  mensagem: string,
  telefoneWhatsApp: string,
  abrirNovaJanela: boolean = true
): ResultadoWhatsApp => {
  if (typeof window === 'undefined') {
    console.warn('enviarParaWhatsApp chamado durante SSR');
    return { sucesso: false, url: '', popupBloqueado: false };
  }

  try {
    // ⭐⭐ VALIDAÇÃO INICIAL
    if (!telefoneWhatsApp || !mensagem) {
      console.error('Telefone ou mensagem vazios');
      return { sucesso: false, url: '', popupBloqueado: false };
    }
    
    const telefoneFormatado = formatarTelefoneWhatsApp(telefoneWhatsApp);
    
    if (!telefoneFormatado) {
      console.error('Falha ao formatar telefone:', telefoneWhatsApp);
      return { sucesso: false, url: '', popupBloqueado: false };
    }
    
    // ⭐⭐ USAR wa.me (mais confiável que web.whatsapp.com)
    const mensagemCodificada = encodeURIComponent(mensagem);
    const url = `https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`;
    
    console.log('📲 Gerando link WhatsApp:', url);

    if (abrirNovaJanela) {
      // ⭐⭐ TENTAR ABRIR COM FALLBACK SE BLOQUEADO
      const janelaAberta = window.open(url, '_blank', 'noopener,noreferrer,width=800,height=600');

      if (!janelaAberta || janelaAberta.closed || typeof janelaAberta.closed === 'undefined') {
        console.warn('⚠️ Popup bloqueado pelo navegador, tentando fallback...');
        
        // Fallback 1: Tentar com window.location (pode não funcionar em alguns navegadores)
        setTimeout(() => {
          window.location.href = url;
        }, 100);
        
        // Fallback 2: Mostrar URL para usuário copiar
        setTimeout(() => {
          if (confirm('Não foi possível abrir o WhatsApp automaticamente. Clique em OK para ver o link.')) {
            prompt('Copie este link e cole no WhatsApp:', url);
          }
        }, 500);
        
        return { sucesso: false, url, popupBloqueado: true };
      }

      return { sucesso: true, url, popupBloqueado: false };
    }

    return { sucesso: true, url, popupBloqueado: false };
  } catch (error: any) {
    console.error('❌ Erro ao enviar para WhatsApp:', error);
    return { sucesso: false, url: '', popupBloqueado: false };
  }
};