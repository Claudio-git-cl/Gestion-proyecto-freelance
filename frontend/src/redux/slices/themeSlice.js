import { createSlice } from '@reduxjs/toolkit';

// Obtener el tema guardado en localStorage o usar el tema del sistema
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme !== null) {
    return JSON.parse(savedTheme);
  }
  // Detectar preferencia del sistema
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    darkMode: getInitialTheme()
  },
  reducers: {
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', JSON.stringify(action.payload));
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
    }
  }
});

export const { setDarkMode, toggleDarkMode } = themeSlice.actions;
export default themeSlice.reducer;