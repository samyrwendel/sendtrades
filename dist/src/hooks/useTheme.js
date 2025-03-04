import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const useTheme = create()(persist((set) => ({
    theme: 'dark',
    setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
        else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    },
}), {
    name: 'theme-storage',
    getStorage: () => localStorage,
}));
export default useTheme;
