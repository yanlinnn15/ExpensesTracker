import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import Router from './routes/Router';
import { AuthContext } from './helpers/AuthContext';
import { useState, useEffect } from 'react';
import api from './api';
import { baselightTheme } from "./theme/DefaultColors";
import logger from './helpers/logger';
import { Analytics } from '@vercel/analytics/react';

const App = () => {
  const [authState, setAuthState] = useState({ fname: "", id: 0, status: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      api.get('/auth/auth')
        .then((response) => {
          if (response.data.error) {
            setAuthState({ ...authState, status: false });
          } else {
            const isGuest = response.data.isGuest || false;
            if (isGuest) {
              localStorage.setItem('isGuest', 'true');
            }
            setAuthState({
              fname: response.data.fname,
              id: response.data.id,
              status: true,
              isGuest,
            });
          }
        })
        .catch((error) => {
          logger.error("Error fetching auth status:", error);
          setError("Failed to authenticate. Please log in again.");
          setAuthState({ ...authState, status: false });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const routing = useRoutes(Router);
  const theme = baselightTheme;

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {routing}
        <Analytics />
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

export default App;
