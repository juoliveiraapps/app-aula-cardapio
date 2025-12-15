import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '../../services/adminService';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, currentImage }) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem');
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

    // Upload para Cloudinary
    setUploading(true);
    setError('');

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      onImageUploaded(imageUrl);
      setError('');
    } catch (err) {
      setError('Erro ao fazer upload da imagem. Tente novamente.');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-200">
          Imagem do Produto
        </label>
        <span className="text-xs text-gray-400">JPG, PNG • Máx. 5MB</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <div className="bg-gray-800 rounded-xl p-4 border-2 border-dashed border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Imagem carregada</p>
                  <p className="text-xs text-gray-400">Clique para alterar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3">
              <div className="relative aspect-square max-w-xs mx-auto rounded-lg overflow-hidden bg-gray-900">
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
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className={`bg-gray-800 rounded-xl p-8 border-2 border-dashed ${
            error ? 'border-red-500/50' : 'border-gray-700 hover:border-[#e58840]/50'
          } transition-all duration-300 cursor-pointer text-center`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e58840]"></div>
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-white font-medium">
                {uploading ? 'Enviando imagem...' : 'Clique para fazer upload'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Arraste ou clique para selecionar
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {uploading && (
        <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-3">
          <p className="text-blue-400 text-sm flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-2"></div>
            Enviando imagem para Cloudinary...
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;