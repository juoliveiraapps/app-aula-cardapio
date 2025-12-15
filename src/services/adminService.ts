import axios from 'axios';

// Configurações do Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dm5scqxho'; // Seu cloud name
const CLOUDINARY_UPLOAD_PRESET = 'cardapio_upload'; // Você precisa criar esse preset no Cloudinary

// Serviço para upload de imagens
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'cardapio/produtos'); // Pasta organizada

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Retorna URL otimizada para web
    return response.data.secure_url;
  } catch (error) {
    console.error('Erro no upload para Cloudinary:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
};

// Serviço para salvar produto no Google Sheets
export const saveProductToSheet = async (productData: any): Promise<any> => {
  try {
    const response = await fetch('/api?action=saveProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar produto');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    throw error;
  }
};

// Serviço para buscar produtos existentes
export const getExistingProducts = async () => {
  try {
    const response = await fetch('/api?action=getProdutos');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};