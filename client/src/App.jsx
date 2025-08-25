import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import Router from './routes/Router.jsx';
import { AuthContext } from './helpers/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { baselightTheme } from "./theme/DefaultColors";
import API_URL from './config/api';

const App = () => {
  const [authState, setAuthState] = useState({ 
    fname: "", 
    id: 0, 
    status: false 
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if(token){
      axios.get(`${API_URL}/auth/auth`, {
        headers: {
          accessToken: localStorage.getItem('accessToken'),
        }
      })
        .then((response) => {
          if (response.data.error) {
            setAuthState({ ...authState, status: false });
          } else {
            setAuthState({
              fname: response.data.fname,
              id: response.data.id,
              status: true,
            });
          }
        })
        .catch((error) => {
          console.error('Auth check error:', error);
          setAuthState({ ...authState, status: false });
        });
    }
  }, []);

  const routing = useRoutes(Router);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <ThemeProvider theme={baselightTheme}>
        <CssBaseline />
        {routing}
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

export default App;
