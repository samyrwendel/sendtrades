import { BotLog } from './types';
import { supabaseAdmin } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const API_URL = typeof process !== 'undefined' && process.env.VITE_API_URL 
  ? process.env.VITE_API_URL 
  : 'http://localhost:3000';

// Versão para o cliente (browser)
export async function addLog(logData: Omit<BotLog, 'id' | 'timestamp'>) {
  try {
    const token = localStorage.getItem('session');
    if (!token) {
      console.error('❌ Sessão expirada');
      return null;
    }

    const response = await fetch(`${API_URL}/api/logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logData)
    });

    const data = await response.json();
    
    if (data.success) {
      return data.log;
    } else {
      console.error('❌ Erro ao criar log:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar log:', error);
    return null;
  }
}

// Versão para o servidor
export async function addServerLog(logData: Omit<BotLog, 'id' | 'timestamp'>) {
  try {
    const { data: log, error } = await supabaseAdmin
      .from('BotLog')
      .insert([{
        id: uuidv4(),
        ...logData,
        clientip: logData.clientIp || 'unknown',
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar log:', error);
      return null;
    }

    return log;
  } catch (error) {
    console.error('❌ Erro ao criar log:', error);
    return null;
  }
}

export function formatLogDetails(details: any): string {
  if (typeof details === 'string') {
    return details;
  }
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
} 