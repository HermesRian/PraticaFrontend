import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import DashboardLayoutToolpad from './components/layout/DashboardLayoutToolpad';
import MainContent from './components/layout/MainContent';

// Tema customizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <DashboardLayoutToolpad>
          <MainContent />
        </DashboardLayoutToolpad>
      </Router>
    </ThemeProvider>
  );
};

export default App;