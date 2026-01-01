import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function usePersistedTheme() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Load saved theme on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('theme');
        if (saved) setTheme(saved as any);
    }, [setTheme]);

    // Save whenever it changes
    useEffect(() => {
        if (theme) localStorage.setItem('theme', theme);
    }, [theme]);

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
    };

    return { theme: mounted ? theme : systemTheme, toggle, setTheme, mounted };
}
