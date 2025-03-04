import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs oficiais dos ícones dos tokens
const TOKEN_ICONS = {
  // Stablecoins
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  BUSD: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png',

  // Principais criptomoedas
  BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  XRP: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  
  // Pi Network do CoinMarketCap
  PI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/35697.png'
};

async function downloadTokenIcons() {
  const ICONS_DIR = path.join(process.cwd(), 'public', 'assets', 'tokens');

  // Garante que o diretório existe
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Função para baixar um arquivo
  const downloadFile = async (url, filename, token) => {
    try {
      const filepath = path.join(ICONS_DIR, filename);
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 10000 // 10 segundos de timeout
      });

      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`✓ ${token}: ${filename} baixado com sucesso`);
          resolve();
        });
        writer.on('error', (error) => {
          const downloadError = new Error(`Erro ao salvar ${filename}: ${error.message}`);
          reject(downloadError);
        });
      });
    } catch (error) {
      throw new Error(
        `Erro ao baixar ${token}: ${error.response?.statusText || error.message}`
      );
    }
  };

  // Baixa todos os ícones
  const errors = [];
  for (const [token, url] of Object.entries(TOKEN_ICONS)) {
    if (typeof url === 'string' && url.startsWith('http')) { // Só baixa se for URL externa
      const filename = `${token.toLowerCase()}.png`;
      try {
        await downloadFile(url, filename, token);
      } catch (error) {
        errors.push(error);
        console.error(`❌ Erro ao baixar ${token}:`, error.message);
      }
    }
  }

  // Reporta erros no final
  if (errors.length > 0) {
    console.error('\nResumo dos erros:');
    errors.forEach(error => {
      console.error(`- ${error.message}`);
    });
    throw new Error(`Falha ao baixar ${errors.length} ícone(s)`);
  }
}

console.log('🔄 Iniciando download dos ícones dos tokens...\n');

downloadTokenIcons()
  .then(() => {
    console.log('\n✅ Download dos ícones concluído!');
  })
  .catch((error) => {
    console.error('\n❌ Erro durante o download:', error.message);
    process.exit(1);
  }); 