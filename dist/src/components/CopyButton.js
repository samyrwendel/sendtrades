import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
export function CopyButton({ text, className }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Exemplo copiado!');
            setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            toast.error('Erro ao copiar exemplo');
        }
    };
    return (_jsx(Button, { variant: "ghost", size: "sm", onClick: handleCopy, className: className, title: "Copiar exemplo", children: copied ? (_jsx(Check, { className: "h-4 w-4 text-green-500" })) : (_jsx(Copy, { className: "h-4 w-4" })) }));
}
