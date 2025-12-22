const validarCupomFrontend = async () => {
  if (!codigoCupom.trim()) {
    setCupomErro('Digite um código de cupom');
    return;
  }

  setValidandoCupom(true);
  setCupomErro('');

  try {
    const params = {
      key: 'cce4d5770afe09d2c790dcca4272e1190462a6a574270b040c835889115c6914',
      action: 'validarCupom',
      codigo: codigoCupom.trim().toUpperCase(),
      subtotal: subtotal,
      tipo_entrega: tipoEntrega
    };
    
    console.log('Enviando dados para API:', params);

    const resposta = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });

    console.log('Status da resposta:', resposta.status);
    
    if (!resposta.ok) {
      throw new Error(`HTTP error! status: ${resposta.status}`);
    }

    const resultado = await resposta.json();
    
    console.log('Resposta cupom:', resultado);
    
    if (resultado.valido) {
      setCupomValido(resultado);
      setCupomAplicado(true);
      setCupomErro('');
    } else {
      setCupomValido(null);
      setCupomAplicado(false);
      setCupomErro(resultado.mensagem || 'Cupom inválido');
    }
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    setCupomErro('Erro ao validar cupom. Tente novamente.');
    setCupomValido(null);
    setCupomAplicado(false);
  } finally {
    setValidandoCupom(false);
  }
};