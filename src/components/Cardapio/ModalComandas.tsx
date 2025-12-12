import React, { useState } from 'react';

interface ModalComandasProps {
  isOpen: boolean;
  onClose: () => void;
  onSelecionarComanda: (numero: string, nome: string) => void;
}

export const ModalComandas: React.FC<ModalComandasProps> = ({
  isOpen,
  onClose,
  onSelecionarComanda
}) => {
  const [comandaSelecionada, setComandaSelecionada] = useState<string>('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualNumber, setManualNumber] = useState('');

  // Comandas disponíveis
  const comandasDisponiveis = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const handleConfirmar = () => {
    if (comandaSelecionada && nomeCliente.trim()) {
      onSelecionarComanda(comandaSelecionada, nomeCliente);
    }
  };

  const handleManualConfirm = () => {
    if (manualNumber && nomeCliente.trim()) {
      onSelecionarComanda(manualNumber, nomeCliente);
    }
  };

  const handleVoltar = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary-900 text-white p-4 text-center relative">
          <h2 className="text-xl font-bold">Sua Comanda</h2>
          <p className="text-secondary-200 text-sm">Para consumo no local</p>
          <button
            onClick={handleVoltar}
            className="absolute top-3 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Nome do Cliente */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Seu nome *
            </label>
            <input
              type="text"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Botão para entrada manual */}
          <div className="mb-6">
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-primary-700 flex items-center justify-center"
            >
              {showManualInput ? (
                <>
                  <span className="mr-2">←</span>
                  Voltar para lista
                </>
              ) : (
                <>
                  <span className="mr-2">🔢</span>
                  Digitar número manualmente
                </>
              )}
            </button>
          </div>

          {showManualInput ? (
            /* Entrada manual */
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-900 mb-2 text-center">
                Digite o número da sua comanda
              </label>
              <div className="flex justify-center">
                <input
                  type="text"
                  value={manualNumber}
                  onChange={(e) => setManualNumber(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="Ex: 001"
                  className="w-32 p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-3xl font-bold"
                />
              </div>
              <p className="text-xs text-primary-500 mt-2 text-center">
                Digite o número da comanda que recebeu
              </p>
            </div>
          ) : (
            /* Grade de comandas */
            <div className="mb-6">
              <h3 className="font-bold text-primary-900 mb-3 text-center">
                Selecione sua comanda/mesa
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {comandasDisponiveis.map((numero) => (
                  <button
                    key={numero}
                    onClick={() => setComandaSelecionada(numero)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-300 
                      flex flex-col items-center justify-center
                      ${comandaSelecionada === numero
                        ? 'bg-primary-900 border-primary-900 text-white transform scale-105'
                        : 'bg-white border-gray-200 hover:border-primary-400 hover:bg-primary-50'
                      }
                    `}
                  >
                    {/* Número da comanda */}
                    <span className="text-2xl font-bold">{numero}</span>
                    
                    {/* Badge */}
                    <span className={`
                      text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full
                      ${comandaSelecionada === numero
                        ? 'bg-primary-700 text-white'
                        : 'bg-green-100 text-green-700'
                      }
                    `}>
                      Disponível
                    </span>

                    {/* Checkmark quando selecionado */}
                    {comandaSelecionada === numero && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <span className="text-blue-600 text-lg">💡</span>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 text-sm mb-2">Como funciona?</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Selecione o número da sua comanda/mesa</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Se não souber, peça ao atendente</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Seu pedido será entregue no seu local</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Pague diretamente com o atendente</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {showManualInput ? (
            <button
              onClick={handleManualConfirm}
              disabled={!manualNumber || !nomeCliente.trim()}
              className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                manualNumber && nomeCliente.trim()
                  ? 'bg-primary-900 text-white hover:bg-primary-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {manualNumber 
                ? `Usar Comanda #${manualNumber}` 
                : 'Digite um número'}
            </button>
          ) : (
            <div>
              {comandaSelecionada && nomeCliente && (
                <div className="text-center mb-3">
                  <p className="text-sm font-medium text-primary-900">
                    Comanda selecionada: <span className="font-bold text-lg">#{comandaSelecionada}</span>
                  </p>
                  <p className="text-sm text-primary-600">Cliente: {nomeCliente}</p>
                </div>
              )}
              <button
                onClick={handleConfirmar}
                disabled={!comandaSelecionada || !nomeCliente.trim()}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                  comandaSelecionada && nomeCliente.trim()
                    ? 'bg-primary-900 text-white hover:bg-primary-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {comandaSelecionada 
                  ? `Confirmar Comanda #${comandaSelecionada}` 
                  : 'Selecione uma comanda'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalComandas;