import axios from 'axios';
import { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const AppContent = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(false); // Cambiado a null en lugar de false

  // Función para obtener los datos del usuario
  const getUserData = async () => {
  try {
    const { data } = await axios.get(`${backendUrl}/api/user/data`);
    console.log(data);  // Verifica que los datos sean los esperados
    if (data.success) {
      setUserData(data.userData);  // Almacena los datos del usuario si es exitoso
    } else {
      toast.error(data.message); // Si la respuesta no es exitosa
    }
  } catch (error) {
    toast.error(`Error: ${error.response?.data?.message || error.message}`);
    console.error(error);  // Verifica detalles del error
  }
};

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
