// src/components/admin/ImageUploader.tsx
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImage,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Substitua com seu Cloud Name do Cloudinary
  const CLOUD_NAME = 'seu-cloud-name-aqui';
  const UPLOAD_PRESET = 'seu-upload-preset-aqui';

  const handleFileSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor, selecione uma imagem válida (JPEG, PNG, WebP ou GIF)');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    // Criar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload para Cloudinary
    await uploadToCloudinary(file);
  };

  const uploadToCloudinary = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);
      
      // Para otimização de imagem
      formData.append('folder', 'cardapio-digital');
      formData.append('transformation', 'c_fill,w_800,h_600,q_auto:good');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      
      // Retornar a URL otimizada
      const optimizedUrl = data.secure_url.replace('/upload/', '/upload/c_fill,w_800,h_600,q_auto:good/');
      
      onImageUploaded(optimizedUrl);
      alert('Imagem enviada com sucesso!');
      
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Limpar input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteUrl = () => {
    const url = prompt('Cole a URL da imagem:');
    if (url) {
      setPreviewUrl(url);
      onImageUploaded(url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Área de preview */}
      <div className="relative">
        <div 
          className={`aspect-video rounded-lg border-2 border-dashed ${
            previewUrl 
              ? 'border-transparent' 
              : 'border-gray-600 hover:border-[#e58840]'
          } transition-colors overflow-hidden bg-gray-900/50 flex items-center justify-center cursor-pointer ${
            disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={handleFileSelect}
        >
          {previewUrl ? (
            <div className="relative w-full h-full group">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/374151/9ca3af?text=Erro+na+imagem';
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Trocar imagem</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-[#e58840] animate-spin" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-300 font-medium mb-1">
                {uploading ? 'Enviando imagem...' : 'Clique para enviar imagem'}
              </p>
              <p className="text-sm text-gray-500">
                JPEG, PNG, WebP ou GIF • Máx. 5MB
              </p>
            </div>
          )}
        </div>

        {/* Botão para remover imagem */}
        {previewUrl && !disabled && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
            title="Remover imagem"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleFileSelect}
          disabled={disabled || uploading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          {previewUrl ? 'Trocar Imagem' : 'Selecionar Imagem'}
        </button>
        
        <button
          type="button"
          onClick={handlePasteUrl}
          disabled={disabled || uploading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-4 h-4" />
          Colar URL
        </button>
      </div>

      {/* Dicas */}
      <div className="text-sm text-gray-400 space-y-1">
        <p>• A imagem será otimizada automaticamente</p>
        <p>• Tamanho recomendado: 800×600 pixels</p>
        <p>• Você também pode colar uma URL diretamente</p>
      </div>
    </div>
  );
};

export default ImageUploader;