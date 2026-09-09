import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const isDarkTheme = savedTheme === 'mytheme-dark';
      setIsDark(isDarkTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      const theme = prefersDark ? 'mytheme-dark' : 'mytheme';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, []);

  const handleThemeToggle = useCallback((checked: boolean) => {
    setIsDark(checked);
    const newTheme = checked ? 'mytheme-dark' : 'mytheme';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  return {
    isDark,
    handleThemeToggle,
  };
};

export default useTheme;
