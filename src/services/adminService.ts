// src/services/adminService.ts
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// URL base para API - usa proxy no dev, direto no production
const getApiBase = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com';
  }
  return ''; // No dev, usa o proxy relativo
};

// Serviço para upload de imagens (usando proxy no dev)
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'cardapio/produtos');
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    // No desenvolvimento, podemos usar o proxy se configurado
    // Em produção, vai direto para Cloudinary
    const url = import.meta.env.DEV 
      ? `/cloudinary/${CLOUDINARY_CLOUD_NAME}/image/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

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

// Função auxiliar para fazer requests à API
const apiRequest = async (action: string, method: string = 'GET', data?: any) => {
  const baseUrl = getApiBase();
  
  // Constrói a URL
  let url = import.meta.env.PROD 
    ? `${baseUrl}/macros/s/${import.meta.env.VITE_GOOGLE_SCRIPT_ID}/exec`
    : `/api`;
  
  // Adiciona ação e chave (a chave é adicionada automaticamente pelo proxy no dev)
  const params = new URLSearchParams();
  params.append('action', action);
  
  if (import.meta.env.PROD && import.meta.env.VITE_API_KEY) {
    params.append('key', import.meta.env.VITE_API_KEY);
  }
  
  url += `?${params.toString()}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Accept': 'application/json',
    },
  };
  
  if (data && method !== 'GET') {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success && result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error(`API Request error (${action}):`, error);
    throw error;
  }
};

// Serviços simplificados
export const saveProductToSheet = (productData: any) => 
  apiRequest('saveProduct', 'POST', productData);

export const deleteProductFromSheet = (id: string) => 
  apiRequest('deleteProduct', 'POST', { id });

export const saveCategoryToSheet = (categoryData: any) => 
  apiRequest('salvarCategoria', 'POST', categoryData);

export const deleteCategoryFromSheet = (id: string) => 
  apiRequest('deletarCategoria', 'POST', { id });

// Serviço para buscar dados
export const fetchSheetData = async (action: string) => {
  try {
    const result = await apiRequest(action, 'GET');
    return result;
  } catch (error) {
    console.error(`Error fetching ${action}:`, error);
    return { success: false, error: 'Failed to fetch data' };
  }
};