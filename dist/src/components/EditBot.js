import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WebhookExamples } from './WebhookExamples';
const API_URL = import.meta.env.VITE_API_URL;
export function EditBot() {
    const { id } = useParams();
    const location = useLocation();
    const [pairs, setPairs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        tradingPair: '',
        selectedPair: '',
        exchange: null,
        baseAsset: '',
        quoteAsset: '',
        public_id: ''
    });
    // Carregar dados do bot
    useEffect(() => {
        const loadBot = async () => {
            try {
                if (id) {
                    const token = localStorage.getItem('session');
                    const response = await fetch(`${API_URL}/api/bots/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        throw new Error('Falha ao carregar dados do bot');
                    }
                    const data = await response.json();
                    console.log('📥 Dados do bot carregados:', data);
                    // Usar o tradingPair diretamente do banco
                    setFormData({
                        name: data.name || '',
                        tradingPair: data.tradingPair || '',
                        selectedPair: data.tradingPair || '', // Usar o tradingPair diretamente
                        exchange: data.exchange || null,
                        baseAsset: data.baseAsset || '',
                        quoteAsset: data.quoteAsset || '',
                        public_id: data.public_id || ''
                    });
                    console.log('🔄 Par selecionado:', data.tradingPair);
                    // Carregar pares disponíveis da exchange
                    if (data.exchange?.name) {
                        await loadTradingPairs(data.exchange.name);
                    }
                }
            }
            catch (error) {
                console.error('❌ Erro ao carregar bot:', error);
                toast.error('Erro ao carregar dados do bot');
            }
            finally {
                setIsLoading(false);
            }
        };
        loadBot();
    }, [id]);
    return (_jsxs("div", { className: "space-y-8 p-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Editar Bot" }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Par de Trading" }), _jsxs(Select, { value: formData.selectedPair, onValueChange: (value) => {
                            console.log('📊 Par selecionado:', value);
                            setFormData(prev => ({ ...prev, selectedPair: value }));
                        }, disabled: isLoading, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Selecione um par..." }) }), _jsx(SelectContent, { children: pairs.map((pair) => (_jsxs(SelectItem, { value: pair.symbol, children: [pair.baseAsset, "/", pair.quoteAsset] }, pair.symbol))) })] })] }), _jsxs("div", { className: "mt-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-4 dark:text-white", children: "Exemplos de Webhook" }), _jsx(WebhookExamples, { publicId: formData.public_id || '', tradingPair: formData.tradingPair || '' })] })] }));
}
