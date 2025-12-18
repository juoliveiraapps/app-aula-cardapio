export const saveProductToSheet = async (productData: any) => {
  try {
    console.log('📤 Enviando produto para API:', productData);
    
   
    const dataToSend = {
      ...productData,
      
      ...(productData.id && { produto_id: productData.id }),
      // Remover o campo "id" antigo se existir
      id: undefined
    };
    
    // Opcional: remover o campo id do objeto
    delete dataToSend.id;
    
    console.log('📤 Dados processados para envio:', dataToSend);

    const response = await fetch('/api?action=saveProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend), // ⬅️ Enviar o objeto corrigido
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

    const response = await fetch('/api?action=deleteProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
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