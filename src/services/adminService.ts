export const saveProductToSheet = async (productData: any) => {
  try {
    console.log('📤 Enviando produto para API:', productData);

    // 🔧 CORREÇÃO: Converter o preço corretamente
    const dataToSend = {
      ...productData,
      // Converter preço de string para número, tratando vírgula como decimal
      preco: typeof productData.preco === 'string' 
        ? parseFloat(productData.preco.replace(',', '.'))
        : productData.preco
    };

    console.log('📤 Dados processados para envio:', dataToSend);

    const response = await fetch('/api?action=saveProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
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

// Funções para categorias
export const saveCategoryToSheet = async (categoryData: any) => {
  try {
    console.log('📤 Enviando categoria para API:', categoryData);

    const response = await fetch('/api?action=salvarCategoria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da API (categoria):', data);
    return data;

  } catch (error) {
    console.error('❌ Erro na função saveCategoryToSheet:', error);
    throw error;
  }
};

export const deleteCategoryFromSheet = async (id: string) => {
  try {
    console.log('🗑️ Solicitando exclusão da categoria:', id);

    const response = await fetch('/api?action=deletarCategoria', {
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
    console.log('✅ Resposta da exclusão (categoria):', data);
    return data;

  } catch (error) {
    console.error('❌ Erro na função deleteCategoryFromSheet:', error);
    throw error;
  }
};