import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContent = createContext();

export const AppContextProvider = (props) => {
  
  axios.defaults.withCredentials = true; // Asegurarse de que las cookies se envíen correctamente.

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null); // Inicializar en null

  // Verifica el estado de autenticación
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      } 
    } catch (error) {
      toast.error( error.message); // Mejor manejo de errores
    }
  };

  // Obtener los datos del usuario
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || 'Unable to fetch user data');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Llamar a getAuthState cuando el componente se monta
  useEffect(() => {
    getAuthState();
  }, []); // Solo se ejecutará al montar el componente

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};
