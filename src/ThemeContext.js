import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check if theme is stored in localStorage, default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Check for saved theme or system preference
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // Update theme class on document body and store in localStorage when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class and add new one
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 