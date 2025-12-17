export interface Configuracao {
  telefone_whatsapp: string;
  nome_loja: string;
  pedido_minimo_entrega: number;
  taxa_entrega_padrao: number;
  endereco_loja: string;
  horario_funcionamento: string;
}

export interface Categoria {
  id?: string; // Usado no admin
  categoria_id?: string; // Retornado pela API
  nome: string;
  descricao?: string;
  posicao?: number;
  visivel?: boolean;
  icone_svg?: string;
  icone?: string;
}

export interface OpcaoProduto {
  nome: string;
  opcoes: {
    label: string;
    preco_adicional: number;
  }[];
}

export interface Produto {
  produto_id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria_id: string;
  disponivel: boolean;
  imagem_url: string;
  opcoes?: OpcaoProduto[];
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  opcoes_selecionadas?: {
    [key: string]: {
      label: string;
      preco_adicional: number;
    };
  };
  observacoes?: string;
  preco_total: number;
}

export interface Bairro {
  bairro_id: string;
  nome: string;
  taxa_entrega: number;
}

export type TipoPedido = 'local' | 'retirada' | 'delivery';
export type StatusPedido = 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';

export interface DadosCliente {
  nome: string;
  telefone: string;
  tipo_pedido: TipoPedido;
  comanda?: string;
  forma_pagamento?: string;
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  taxa_entrega?: number;
}

export interface Pedido {
  pedido_id: string;
  timestamp: string;
  cliente: DadosCliente;
  itens: ItemCarrinho[];
  subtotal: number;
  taxa_entrega: number;
  total: number;
  status: StatusPedido;
  observacoes_gerais?: string;
}

export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
export interface CategoryFormData {
  id?: string;
  nome: string;
  descricao: string;
  posicao: number;
  visivel: boolean;
  icone_svg: string;
}
