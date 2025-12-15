// src/services/adminService.ts
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dm5scqxho';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cardapio_upload';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Serviço para upload de imagens (usando fetch nativo)
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'cardapio/produtos');

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

// Serviço para salvar produto no Google Sheets
export const saveProductToSheet = async (productData: any): Promise<any> => {
  try {
    const response = await fetch(`/api?action=saveProduct&key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao salvar produto');
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    throw error;
  }
};

// Serviço para deletar produto
export const deleteProductFromSheet = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`/api?action=deleteProduct&key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao deletar produto');
    }

    return data;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};

// Serviço para buscar produtos existentes
export const getExistingProducts = async () => {
  try {
    const response = await fetch(`/api?action=getProdutos&key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

// Serviço para salvar categoria
export const saveCategoryToSheet = async (categoryData: any): Promise<any> => {
  try {
    const response = await fetch(`/api?action=salvarCategoria&key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(categoryData),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao salvar categoria');
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar categoria:', error);
    throw error;
  }
};

// Serviço para deletar categoria
export const deleteCategoryFromSheet = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`/api?action=deletarCategoria&key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao deletar categoria');
    }

    return data;
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    throw error;
  }
};