import { supabase } from '../config/supabase';

interface User {
    id: string;
    email: string;
    plan?: string;
}

export const userService = {
    async getUser(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        return data;
    },

    async createUser(userData: Partial<User>): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}; 