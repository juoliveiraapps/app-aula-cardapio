import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CategoryFormProps {
  initialData?: {
    id?: string;
    nome?: string;
    descricao?: string;
    posicao?: number;
    visivel?: boolean;
    icone_svg?: string;
  };
  onSubmit: (data: any) => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
}

interface IconOption {
  name: string;
  path: string;
  viewBox?: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  onClose,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    posicao: 1,
    visivel: true,
    icone_svg: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4' // Ícone padrão café
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Ícones pré-definidos para cafeteria (com viewBox adequado)
  const iconOptions: IconOption[] = [
    { name: 'Café', path: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4' },
    { name: 'Bolo', path: 'M6 2v2 M18 2v2 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M3 10h18 M8 14h8' },
    { name: 'Suco', path: 'M17 2h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2 M7 22h10 M12 2v20' },
    { name: 'Sanduíche', path: 'M18 8L22 12L18 16 M6 8L2 12L6 16 M14.5 12H2 M21.5 12H14.5' },
    { name: 'Bebida', path: 'M7 2h10l4 14H3L7 2z M10 16v6 M14 16v6' },
    { name: 'Doce', path: 'M10 3.5V10M14 3.5V10M18 10a8 8 0 1 1-16 0V3.5' },
    { name: 'Garfo', path: 'M15 21v-8a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v8 M17 21V11a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10' },
    { name: 'Faca', path: 'M15.5 9l-6.06 6.06a2 2 0 1 0 2.83 2.83L18.34 11.5' },
    { name: 'Colher', path: 'M10 2v2.343 M14 2v3.343 M8 10h8 M2 2h20v20H2z M4 12h16v8H4z' },
    { name: 'Xícara', path: 'M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z M6 1v3 M10 1v3 M14 1v3' },
    { name: 'Garrafa', path: 'M10 2v2 M14 2v2 M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1 M6 2v2' },
    { name: 'Estrela', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { name: 'Coração', path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
    { name: 'Fogo', path: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' },
    { name: 'Folha', path: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z' },
    { name: 'Pizza', path: 'M12 2a10 10 0 1 0 10 10H12V2z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  ];

  // Inicializar formData com dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        descricao: initialData.descricao || '',
        posicao: initialData.posicao || 1,
        visivel: initialData.visivel !== false,
        icone_svg: initialData.icone_svg || 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.nome.trim()) {
      errors.nome = 'Nome da categoria é obrigatório';
    }
    
    if (formData.posicao < 1) {
      errors.posicao = 'Posição deve ser maior que 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const success = await onSubmit(formData);
    if (success) {
      // Reset form only on success
      if (!initialData?.id) {
        setFormData({
          nome: '',
          descricao: '',
          posicao: 1,
          visivel: true,
          icone_svg: 'M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4'
        });
      }
    }
  };

  const handleIconSelect = (path: string) => {
    setFormData({ ...formData, icone_svg: path });
  };

  // Função corrigida para renderizar SVG path corretamente
  const renderIconSVG = (svgPath: string, size: number = 24) => {
    // Dividir por espaços, mas manter comandos multi-parte juntos
    const pathCommands = [];
    let currentCommand = '';
    
    // Processar os comandos do path
    const parts = svgPath.split(' ');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // Se a parte começa com uma letra (comando), é um novo comando
      if (part.match(/^[A-Za-z]/)) {
        if (currentCommand) {
          pathCommands.push(currentCommand.trim());
        }
        currentCommand = part;
      } else {
        // É parte do comando anterior
        currentCommand += ' ' + part;
      }
    }
    
    // Adicionar o último comando
    if (currentCommand) {
      pathCommands.push(currentCommand.trim());
    }
    
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-300"
      >
        {pathCommands.map((command, index) => {
          // Extrair o comando (M, L, C, etc.) e as coordenadas
          const match = command.match(/^([A-Za-z])(.*)$/);
          if (!match) return null;
          
          const [, cmd, coords] = match;
          
          return (
            <path 
              key={index} 
              d={`${cmd}${coords}`}
            />
          );
        })}
      </svg>
    );
  };

  // Função simplificada para renderizar os ícones na grid
  const renderIconPreview = (svgPath: string, size: number = 20) => {
    // Versão simplificada para a grid de ícones
    const commands = svgPath.split(/(?=[A-Z])/).filter(cmd => cmd.trim());
    
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-300"
      >
        {commands.map((command, index) => (
          <path key={index} d={command.trim()} />
        ))}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              {initialData?.id ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            <p className="text-gray-400 text-sm">
              {initialData?.id ? 'Atualize os dados da categoria' : 'Preencha os dados da nova categoria'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome e Posição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Categoria *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent ${
                  formErrors.nome ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="Ex: Cafés Especiais"
                disabled={loading}
              />
              {formErrors.nome && (
                <p className="mt-1 text-sm text-red-400">{formErrors.nome}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Posição no Menu *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.posicao}
                onChange={(e) => setFormData({ ...formData, posicao: parseInt(e.target.value) || 1 })}
                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent ${
                  formErrors.posicao ? 'border-red-500' : 'border-gray-700'
                }`}
                disabled={loading}
              />
              {formErrors.posicao && (
                <p className="mt-1 text-sm text-red-400">{formErrors.posicao}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Número que define a ordem no cardápio</p>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent"
              placeholder="Descreva esta categoria para seus clientes..."
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">Aparece como texto explicativo no cardápio</p>
          </div>

          {/* Seletor de Ícones */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ícone da Categoria
            </label>
            
            {/* Preview do ícone selecionado */}
            <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                  {renderIconSVG(formData.icone_svg, 32)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Ícone selecionado:</p>
                  <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-gray-300 font-mono text-xs break-all">
                      {formData.icone_svg}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de ícones */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Selecione um ícone:</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleIconSelect(icon.path)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 ${
                      formData.icone_svg === icon.path
                        ? 'bg-[#e58840]/20 border-[#e58840] scale-105'
                        : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 hover:border-gray-600'
                    }`}
                    disabled={loading}
                    title={icon.name}
                  >
                    <div className="w-8 h-8 flex items-center justify-center mb-1">
                      {renderIconPreview(icon.path, 16)}
                    </div>
                    <span className="text-xs text-gray-400 truncate w-full text-center">
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campo manual para SVG path */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ou insira manualmente o SVG path:
              </label>
              <textarea
                value={formData.icone_svg}
                onChange={(e) => setFormData({ ...formData, icone_svg: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#e58840] focus:border-transparent font-mono text-sm"
                placeholder="Ex: M12 2v20 M17 5H9.5a3.5 3.5 0 1 0 0 7H14 M7 19H4"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Formato SVG path: comandos como M, L, C, Q, A separados por espaço
              </p>
            </div>
          </div>

          {/* Visibilidade */}
          <div className="flex items-center space-x-3 p-4 bg-gray-900/30 rounded-lg">
            <div className="relative">
              <input
                type="checkbox"
                id="visivel"
                checked={formData.visivel}
                onChange={(e) => setFormData({ ...formData, visivel: e.target.checked })}
                className="sr-only"
                disabled={loading}
              />
              <label
                htmlFor="visivel"
                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  formData.visivel ? 'bg-[#e58840]' : 'bg-gray-700'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${
                  formData.visivel ? 'translate-x-7' : 'translate-x-1'
                }`}></span>
              </label>
            </div>
            <div>
              <label htmlFor="visivel" className="text-gray-300 font-medium cursor-pointer">
                Categoria visível no cardápio
              </label>
              <p className="text-sm text-gray-500">
                {formData.visivel 
                  ? 'Os clientes verão esta categoria no cardápio' 
                  : 'Esta categoria ficará oculta para os clientes'}
              </p>
            </div>
          </div>

          {/* Rodapé com botões */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-[#e58840] to-[#e58840]/90 hover:from-[#e58840]/90 hover:to-[#e58840] text-[#400b0b] font-bold rounded-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <span>{initialData?.id ? 'Atualizar Categoria' : 'Salvar Categoria'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;