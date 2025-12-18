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
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se o Cloudinary está configurado ao montar o componente
  React.useEffect(() => {
    const checkCloudinaryConfig = async () => {
      try {
        const response = await fetch('/api?action=uploadImage', {
          method: 'POST',
          body: JSON.stringify({ checkConfig: true })
        });

        if (response.status === 500) {
          const data = await response.json();
          if (data.error === 'Cloudinary não configurado') {
            setCloudinaryConfigured(false);
            return;
          }
        }

        setCloudinaryConfigured(true);
      } catch (error) {
        console.error('Erro ao verificar configuração do Cloudinary:', error);
        setCloudinaryConfigured(false);
      }
    };

    checkCloudinaryConfig();
  }, []);

  const handleFileSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
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

    // Fazer upload via API própria
    await uploadViaAPI(file);
  };

const uploadViaAPI = async (file: File) => {
  setUploading(true);

  try {
    console.log('🌤️ Enviando para Cloudinary...');
    
    // ⭐⭐ PEGUE DO ENV OU DEFINA DIRETO
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'SEU_CLOUD_NAME_REAL';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cardapio_digital_upload';
    
    console.log('🔧 Config Cloudinary:', { cloudName, uploadPreset });
    
    if (!cloudName || cloudName.includes('SEU_CLOUD_NAME')) {
      throw new Error('Configure o Cloudinary nas variáveis de ambiente!');
    }
    
    // Enviar DIRETO para Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'cardapio-digital');
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    console.log('🔗 Enviando para:', cloudinaryUrl);
    console.log('📦 Dados:', {
      file: file.name,
      size: file.size,
      type: file.type,
      preset: uploadPreset
    });
    
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
      // ⭐⭐ NÃO adicione headers - Cloudinary precisa do Content-Type multipart
    });

    console.log('📡 Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📄 Resposta:', responseText.substring(0, 500));
    
    if (!response.ok) {
      // Tentar parsear erro do Cloudinary
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(`Cloudinary: ${errorData.error?.message || 'Erro desconhecido'}`);
      } catch {
        throw new Error(`Erro ${response.status}: ${responseText.substring(0, 200)}`);
      }
    }
    
    const data = JSON.parse(responseText);
    console.log('✅ Upload bem-sucedido! URL:', data.secure_url);
    
    // Atualizar a imagem no componente pai
    onImageUploaded(data.secure_url);
    
    // Feedback visual
    alert('✅ Imagem enviada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    
    let errorMessage = 'Erro ao fazer upload da imagem. ';
    
    if (error instanceof Error) {
      errorMessage += error.message;
    }
    
    alert(errorMessage);
    
    // Opção de fallback: colar URL manualmente
    setTimeout(() => {
      if (confirm('Upload falhou. Deseja colar uma URL manualmente?')) {
        const url = prompt('Cole a URL da imagem:');
        if (url) {
          try {
            new URL(url); // Validar URL
            onImageUploaded(url);
            setPreviewUrl(url);
          } catch {
            alert('URL inválida.');
          }
        }
      }
    }, 500);
    
  } finally {
    setUploading(false);
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
      try {
        new URL(url);
        setPreviewUrl(url);
        onImageUploaded(url);
      } catch {
        alert('Por favor, insira uma URL válida.');
      }
    }
  };

  // Função para aplicar transformações a URLs do Cloudinary
  const optimizeCloudinaryUrl = (url: string) => {
    if (!url.includes('cloudinary.com')) return url;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Encontrar a posição de 'upload'
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex === -1) return url;
      
      // Verificar se já tem transformações
      const hasTransformations = pathParts[uploadIndex + 1]?.includes('c_');
      if (hasTransformations) return url;
      
      // Inserir transformações após 'upload'
      pathParts.splice(uploadIndex + 1, 0, 'c_fill,w_800,h_600,q_auto:good');
      
      urlObj.pathname = pathParts.join('/');
      return urlObj.toString();
    } catch {
      return url;
    }
  };

  // Otimizar URL atual se for do Cloudinary
  const displayUrl = previewUrl ? optimizeCloudinaryUrl(previewUrl) : null;

  return (
    <div className="space-y-4">
      {/* Alerta se Cloudinary não estiver configurado */}
      {cloudinaryConfigured === false && (
        <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-yellow-400 font-semibold mb-1">Cloudinary não configurado</h4>
              <p className="text-yellow-300/90 text-sm mb-3">
                O upload de imagens requer configuração do Cloudinary na Vercel.
              </p>
              <details className="text-sm text-yellow-300/80">
                <summary className="cursor-pointer hover:text-yellow-200 mb-2">
                  Ver instruções de configuração
                </summary>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Acesse o painel da Vercel</li>
                  <li>Vá em Settings → Environment Variables</li>
                  <li>Adicione as variáveis:
                    <ul className="list-disc list-inside pl-4 mt-1">
                      <li><code className="bg-yellow-900/50 px-1 rounded">CLOUDINARY_CLOUD_NAME</code></li>
                      <li><code className="bg-yellow-900/50 px-1 rounded">CLOUDINARY_UPLOAD_PRESET</code></li>
                    </ul>
                  </li>
                  <li>Faça redeploy do projeto</li>
                </ol>
              </details>
              <p className="text-yellow-300/90 text-sm mt-3">
                Enquanto isso, você pode colar URLs de imagens diretamente abaixo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || uploading || cloudinaryConfigured === false}
      />

      {/* Área de preview */}
      <div className="relative">
        <div 
          className={`aspect-video rounded-lg border-2 border-dashed ${
            displayUrl 
              ? 'border-transparent' 
              : 'border-gray-600 hover:border-[#e58840]'
          } transition-colors overflow-hidden bg-gray-900/50 flex items-center justify-center ${
            disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={handleFileSelect}
        >
          {displayUrl ? (
            <div className="relative w-full h-full group">
              <img
                src={displayUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('❌ Erro ao carregar imagem:', displayUrl);
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
        {displayUrl && !disabled && (
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
          disabled={disabled || uploading || cloudinaryConfigured === false}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={cloudinaryConfigured === false ? 'Configure o Cloudinary primeiro' : ''}
        >
          <Upload className="w-4 h-4" />
          {displayUrl ? 'Trocar Imagem' : 'Selecionar Imagem'}
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

      {/* Status */}
      {uploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-[#e58840]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Enviando imagem...</span>
        </div>
      )}

      {/* Dicas */}
      <div className="text-sm text-gray-400 space-y-1">
        <p>• A imagem será otimizada automaticamente para 800×600 pixels</p>
        <p>• Formatos suportados: JPG, PNG, WebP, GIF</p>
        <p>• Tamanho máximo: 5MB</p>
        <p>• Você também pode colar uma URL diretamente</p>
      </div>
    </div>
  );
};

export default ImageUploader;