import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import copy from 'copy-to-clipboard';

interface CopyButtonProps {
  text: string;
  className?: string;
  onCopy?: () => void;
}

export function CopyButton({ text, className = '', onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      copy(text);
      setCopied(true);
      
      // Chama o callback personalizado primeiro
      if (onCopy) {
        onCopy();
      } else {
        // Se não houver callback personalizado, mostra a mensagem padrão
        toast.success('Copiado para a área de transferência!', {
          duration: 1500,
          className: 'bg-black/60 border border-[#4ade80] text-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.3)] backdrop-blur-sm',
        });
      }

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar texto', {
        duration: 2000,
        className: 'bg-black/60 border border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)] backdrop-blur-sm',
      });
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      title="Copiar para área de transferência"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
} 