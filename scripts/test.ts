import * as http from 'http';

interface WebhookPayload {
  action: string;
  ticker: string;
  order_size: string;
  position_size: string;
  schema: string;
  timestamp: string;
  public_id: string;
}

interface LogPayload {
  calculatedQuantity: number;
  currentPrice: number;
  order_size: string;
}

interface Log {
  type: string;
  action: string;
  status: string;
  message: string;
  details?: string;
  payload?: LogPayload;
}

interface LogsResponse {
  success: boolean;
  logs: Log[];
}

const data = JSON.stringify({
  action: "sell",
  ticker: "XRPUSDT",
  order_size: "100%",
  position_size: "1",
  schema: "2",
  timestamp: new Date().toISOString(),
  public_id: "1BB70STK"
} as WebhookPayload);

const options: http.RequestOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('🔄 Enviando ordem de venda...');
console.log('📦 Payload:', data);

const req = http.request(options, (res: http.IncomingMessage) => {
  let responseData = '';

  console.log('\n📥 Resposta recebida:');
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));

  res.on('data', (chunk: Buffer) => {
    responseData += chunk;
  });

  res.on('end', async () => {
    console.log('Resposta:', responseData);
   
    // Se a ordem foi aceita, buscar os detalhes do cálculo
    if (res.statusCode === 200) {
      console.log('\n🔍 Buscando logs do cálculo...');
      
      // Aguardar um momento para o processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fazer requisição para buscar os logs
      const logsOptions: http.RequestOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/logs',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY
        }
      };

      const logsReq = http.request(logsOptions, (logsRes: http.IncomingMessage) => {
        let logsData = '';

        logsRes.on('data', (chunk: Buffer) => {
          logsData += chunk;
        });

        logsRes.on('end', () => {
          try {
            console.log('\n📊 Logs obtidos:', logsData);
            const logs = JSON.parse(logsData) as LogsResponse;
            
            if (logs.success && logs.logs) {
              console.log('\n📊 Detalhes do cálculo:');
              logs.logs.forEach(log => {
                if (log.type === 'webhook' && log.status === 'success') {
                  console.log('\nDetalhes do Log:');
                  console.log('Tipo:', log.type);
                  console.log('Ação:', log.action);
                  console.log('Status:', log.status);
                  console.log('Mensagem:', log.message);
                  
                  // Extrair e formatar detalhes do cálculo
                  if (log.details) {
                    const details = log.details.split('\n').map(line => line.trim()).filter(Boolean);
                    console.log('\nDetalhes do Cálculo:');
                    details.forEach(detail => console.log(detail));
                  }
                  
                  // Mostrar payload com cálculos
                  if (log.payload) {
                    console.log('\nPayload com Cálculos:');
                    const { calculatedQuantity, currentPrice, order_size } = log.payload;
                    console.log('Tamanho da Ordem:', order_size);
                    console.log('Preço Atual:', currentPrice);
                    console.log('Quantidade Calculada:', calculatedQuantity);
                  }
                }
              });
            }
          } catch (error) {
            console.error('❌ Erro ao processar logs:', error instanceof Error ? error.message : 'Erro desconhecido');
          }
        });
      });

      logsReq.on('error', (error: Error) => {
        console.error('❌ Erro ao buscar logs:', error.message);
      });

      logsReq.end();
    }
  });
});

req.on('error', (error: Error) => {
  console.error('❌ Erro ao enviar ordem:', error.message);
});

req.write(data);
req.end(); 