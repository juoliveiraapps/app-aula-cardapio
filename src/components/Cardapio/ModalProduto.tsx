import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import type { Produto, ItemCarrinho } from '../../types';

interface ModalProdutoProps {
  produto: Produto;
  onFechar: () => void;
  onAdicionar: (item: ItemCarrinho) => void;
}

export function ModalProduto({ produto, onFechar, onAdicionar }: ModalProdutoProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [opcoesSelecionadas, setOpcoesSelecionadas] = useState<{
    [key: string]: { label: string; preco_adicional: number };
  }>({});
  const [observacoes, setObservacoes] = useState('');

  const calcularPrecoTotal = () => {
    let precoBase = produto.preco * quantidade;
    const precoOpcoes = Object.values(opcoesSelecionadas).reduce(
      (acc, opcao) => acc + opcao.preco_adicional * quantidade,
      0
    );
    return precoBase + precoOpcoes;
  };

  const handleOpcaoChange = (nomeGrupo: string, opcao: { label: string; preco_adicional: number }) => {
    setOpcoesSelecionadas((prev) => ({
      ...prev,
      [nomeGrupo]: opcao,
    }));
  };

  const handleAdicionar = () => {
    const item: ItemCarrinho = {
      produto,
      quantidade,
      opcoes_selecionadas: Object.keys(opcoesSelecionadas).length > 0 ? opcoesSelecionadas : undefined,
      observacoes: observacoes.trim() || undefined,
      preco_total: calcularPrecoTotal(),
    };

    onAdicionar(item);
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800">{produto.nome}</h2>
          <button
            onClick={onFechar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <img
            src={produto.imagem_url || 'https://via.placeholder.com/600x400/FF6B35/FFFFFF?text=Produto'}
            alt={produto.nome}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          <p className="text-gray-600 mb-6">{produto.descricao}</p>

          {produto.opcoes && produto.opcoes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4">Opções</h3>

              {produto.opcoes.map((grupo) => (
                <div key={grupo.nome} className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">{grupo.nome}</h4>

                  <div className="space-y-2">
                    {grupo.opcoes.map((opcao) => (
                      <label
                        key={opcao.label}
                        className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={grupo.nome}
                            checked={opcoesSelecionadas[grupo.nome]?.label === opcao.label}
                            onChange={() => handleOpcaoChange(grupo.nome, opcao)}
                            className="w-4 h-4 text-orange-500"
                          />
                          <span className="text-gray-800">{opcao.label}</span>
                        </div>

                        {opcao.preco_adicional > 0 && (
                          <span className="text-green-600 font-medium">
                            + R$ {opcao.preco_adicional.toFixed(2)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Alguma observação especial?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="font-medium text-gray-700">Quantidade</span>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantidade((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>

              <span className="text-xl font-bold w-8 text-center">{quantidade}</span>

              <button
                onClick={() => setQuantidade((prev) => prev + 1)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center justify-center transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdicionar}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
          >
            <ShoppingCart className="w-6 h-6" />
            Adicionar - R$ {calcularPrecoTotal().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
