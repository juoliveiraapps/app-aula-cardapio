// src/services/adminService.ts - Versão final
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_KEY = import.meta.env.VITE_API_KEY;

// Detecta se está em desenvolvimento ou produção
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// Função para construir URLs da API
const buildApiUrl = (action: string, params?: Record<string, string>) => {
  if (isDev) {
    // No dev, usa o proxy do Vite (relativo)
    const url = `/api?action=${encodeURIComponent(action)}`;
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
    }
    
    // A chave é adicionada automaticamente pelo proxy
    return queryParams.toString() ? `${url}&${queryParams}` : url;
  }
  
  // Em produção, usa URL completa
  const baseUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  const url = new URL(baseUrl);
  
  url.searchParams.append('action', action);
  url.searchParams.append('key', API_KEY);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
};

// Upload para Cloudinary (otimizada)
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'cardapio/produtos');
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Erro no upload para Cloudinary:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
};

// API Service genérico
const apiService = {
  async request(action: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    const url = buildApiUrl(action);
    
    const options: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        ...(data && method !== 'GET' ? { 'Content-Type': 'application/json' } : {})
      },
      ...(data && method !== 'GET' ? { body: JSON.stringify(data) } : {})
    };

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${action}):`, error);
      throw error;
    }
  },

  // Métodos específicos
  async get(action: string) {
    return this.request(action, 'GET');
  },

  async post(action: string, data: any) {
    return this.request(action, 'POST', data);
  },

  async delete(action: string, id: string) {
    return this.request(action, 'DELETE', { id });
  }
};

// Exportações específicas
export const saveProductToSheet = (data: any) => apiService.post('saveProduct', data);
export const deleteProductFromSheet = (id: string) => apiService.post('deleteProduct', { id });
export const saveCategoryToSheet = (data: any) => apiService.post('salvarCategoria', data);
export const deleteCategoryFromSheet = (id: string) => apiService.post('deletarCategoria', { id });
export const getProducts = () => apiService.get('getProdutos');
export const getCategories = () => apiService.get('getCategorias');