#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado!');
    process.exit(1);
  }

  const envFile = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

async function testAPI() {
  console.log('🧪 Testando conexão com Google Apps Script...\n');

  const env = loadEnv();

  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;
  const API_KEY = env.API_KEY;

  console.log('📋 Configuração:');
  console.log('  GOOGLE_SCRIPT_URL:', GOOGLE_SCRIPT_URL ? '✅ Configurada' : '❌ NÃO CONFIGURADA');
  console.log('  API_KEY:', API_KEY ? `✅ Configurada (${API_KEY.substring(0, 10)}...)` : '❌ NÃO CONFIGURADA');
  console.log('');

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    console.error('❌ Variáveis de ambiente faltando! Configure o arquivo .env');
    process.exit(1);
  }

  const actions = ['getConfig', 'getCategorias', 'getProdutos', 'getBairros', 'getPedidos'];

  console.log('🔍 Testando endpoints:\n');

  for (const action of actions) {
    try {
      const url = `${GOOGLE_SCRIPT_URL}?action=${action}&key=${API_KEY}`;

      console.log(`  → ${action}...`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      if (!response.ok) {
        console.log(`    ❌ Erro ${response.status}: ${response.statusText}`);
        continue;
      }

      const contentType = response.headers.get('content-type');
      const data = await response.json();

      if (data.error) {
        console.log(`    ❌ Erro: ${data.error}`);
      } else {
        const dataSize = JSON.stringify(data).length;
        console.log(`    ✅ OK (${dataSize} bytes)`);

        if (Array.isArray(data)) {
          console.log(`       ${data.length} itens retornados`);
        } else if (data.pedidos && Array.isArray(data.pedidos)) {
          console.log(`       ${data.pedidos.length} pedidos retornados`);
        }
      }

    } catch (error) {
      console.log(`    ❌ Erro: ${error.message}`);
    }
  }

  console.log('\n✅ Teste concluído!\n');
  console.log('💡 Dica: Se todos os testes passaram, a API está funcionando corretamente.');
  console.log('   Agora você pode iniciar o servidor de desenvolvimento: npm run dev\n');
}

testAPI().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  process.exit(1);
});
