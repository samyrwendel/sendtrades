import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOKEN_ICONS, type TokenSymbol } from '../src/lib/constants/tokens.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadTokenIcons() {
  const ICONS_DIR = path.join(process.cwd(), 'public', 'assets', 'tokens');

  // Garante que o diretório existe
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Função para baixar um arquivo
  const downloadFile = async (url: string, filename: string, token: TokenSymbol): Promise<void> => {
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
      if (error instanceof Error) {
        throw new Error(
          `Erro ao baixar ${token}: ${(error as any).response?.statusText || error.message}`
        );
      }
      throw new Error(`Erro ao baixar ${token}: Erro desconhecido`);
    }
  };

  // Baixa todos os ícones
  const errors: Error[] = [];
  for (const [token, url] of Object.entries(TOKEN_ICONS)) {
    if (typeof url === 'string' && url.startsWith('http')) { // Só baixa se for URL externa
      const filename = `${token.toLowerCase()}.png`;
      try {
        await downloadFile(url, filename, token as TokenSymbol);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error);
          console.error(`❌ Erro ao baixar ${token}:`, error.message);
        }
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