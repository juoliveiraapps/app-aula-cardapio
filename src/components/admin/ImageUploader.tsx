import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  currentImage = '',
  disabled = false 
}) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar preview quando currentImage mudar
  React.useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem (JPG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Em produção, aqui você faria o upload para Cloudinary
    // Por enquanto, vamos simular um upload
    setUploading(true);
    setError('');

    try {
      // Simulação de upload (substitua por upload real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // URL fictícia - em produção, use a URL real do Cloudinary
      const mockImageUrl = `https://via.placeholder.com/400x400/1e3a8a/ffffff?text=${encodeURIComponent(file.name.split('.')[0])}`;
      
      onImageUpload(mockImageUrl);
      setError('');
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erro ao fazer upload da imagem. Tente novamente.');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    if (disabled) return;
    
    setPreview('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Imagem do Produto
        </label>
        <span className="text-xs text-gray-500">JPG, PNG • Máx. 5MB</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <div className="relative">
          <div className={`bg-gray-800 rounded-xl p-4 border-2 ${
            disabled ? 'border-gray-700/30 opacity-50' : 'border-gray-700 hover:border-[#e58840]/50'
          } transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  disabled ? 'bg-gray-800' : 'bg-green-900/30'
                }`}>
                  <ImageIcon className={`w-5 h-5 ${
                    disabled ? 'text-gray-500' : 'text-green-400'
                  }`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    disabled ? 'text-gray-500' : 'text-white'
                  }`}>Imagem carregada</p>
                  <p className="text-xs text-gray-500">Clique para alterar</p>
                </div>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                  disabled={uploading}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="mt-3">
              <div className={`relative aspect-square max-w-xs mx-auto rounded-lg overflow-hidden ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onClick={triggerFileInput}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm text-white">Enviando...</p>
                    </div>
                  </div>
                )}
                {disabled && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-sm text-gray-300">Desabilitado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className={`bg-gray-800 rounded-xl p-8 border-2 border-dashed transition-all duration-300 text-center ${
            disabled 
              ? 'border-gray-700/30 opacity-50 cursor-not-allowed' 
              : `cursor-pointer hover:border-[#e58840]/50 ${
                  error ? 'border-red-500/50' : 'border-gray-700'
                }`
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              disabled ? 'bg-gray-900/50' : 'bg-gray-900'
            }`}>
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e58840]"></div>
              ) : (
                <Upload className={`w-8 h-8 ${
                  disabled ? 'text-gray-600' : 'text-gray-400'
                }`} />
              )}
            </div>
            <div>
              <p className={`font-medium ${
                disabled ? 'text-gray-500' : 'text-white'
              }`}>
                {uploading ? 'Enviando imagem...' : 'Clique para fazer upload'}
              </p>
              <p className={`text-sm mt-1 ${
                disabled ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Arraste ou clique para selecionar uma imagem
              </p>
            </div>
          </div>
        </div>
      )}

      {error && !disabled && (
        <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {uploading && !disabled && (
        <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-3">
          <p className="text-blue-400 text-sm flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-2"></div>
            Enviando imagem...
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;