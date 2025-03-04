import { supabase } from '../config/supabase';
describe('Teste de conexão Supabase', () => {
    test('Deve conectar ao Supabase', async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        expect(error).toBeNull();
        expect(data).toBeDefined();
    });
});
