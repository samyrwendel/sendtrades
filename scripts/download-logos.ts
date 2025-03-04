// Este script não é mais usado pois agora usamos apenas logos locais
// Mantido apenas como referência para os URLs originais

/*
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LogoUrls {
  [key: string]: string;
}

// URLs originais dos logos das exchanges
const LOGOS: LogoUrls = {
  'mexc.png': 'https://www.mexc.com/assets/mexc-logo.png',
  'binance.png': 'https://public.bnbstatic.com/image/cms/blog/20200707/631c823b-886e-4e46-9122-0c94f65a45fc.png',
  'kucoin.png': 'https://assets.staticimg.com/cms/media/1lB3PkckFDyfxz6VudCEACBeRRBi6sQQ7DDjz0yWM.svg',
  'bybit.png': 'https://www.bybit.com/bycsi-root/static/images/logo-light.svg',
  'coinbase.png': 'https://www.coinbase.com/assets/images/og-default.jpg',
  'kraken.png': 'https://www.kraken.com/static/images/og-kraken.png'
};

const LOGOS_DIR = path.join(__dirname, '../public/assets/exchanges');

// Garante que o diretório existe
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

// Função para baixar um arquivo
function downloadFile(url: string, filename: string): Promise<void> {
  const filepath = path.join(LOGOS_DIR, filename);
  
  console.log(`Baixando ${filename}...`);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ ${filename} baixado com sucesso`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
}

// Baixa todos os logos
async function downloadAllLogos(): Promise<void> {
  console.log('Iniciando download dos logos...\n');
  
  for (const [filename, url] of Object.entries(LOGOS)) {
    try {
      await downloadFile(url, filename);
    } catch (error) {
      console.error(`Erro ao baixar ${filename}:`, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }
  
  console.log('\nDownload dos logos concluído!');
}

downloadAllLogos();
*/ 