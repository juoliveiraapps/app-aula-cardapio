// src/services/adminService.ts
export const saveProductToSheet = async (productData: any) => {
  try {
    console.log('📤 Enviando produto para API:', productData);
    
    const response = await fetch('/api/save-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da API:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Erro na função saveProductToSheet:', error);
    throw error;
  }
};

export const deleteProductFromSheet = async (id: string) => {
  try {
    console.log('🗑️ Solicitando exclusão do produto:', id);
    
    const response = await fetch(`/api/delete-product/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da exclusão:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Erro na função deleteProductFromSheet:', error);
    throw error;
  }
};