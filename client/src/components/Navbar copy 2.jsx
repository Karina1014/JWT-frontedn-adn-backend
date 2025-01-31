import { useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom'; // Navegar Hook en enrutador
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

//SOLO VALE LO DEL LOGOUT

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent);

// Función para cerrar sesión
const logout = async () => {
  try {
    // Configura para enviar las cookies con la solicitud
    axios.defaults.withCredentials = true;

    // Realiza la solicitud POST al backend
    const { data } = await axios.post(`${backendUrl}/api/auth/logout`);

    console.log('Backend response:', data); // Verifica la respuesta del backend

    // Si la respuesta es exitosa
    if (data.success) {
      setIsLoggedin(false);  // Cambia el estado de inicio de sesión
      setUserData(null);      // Limpia los datos del usuario
      toast.success('Successfully logged out'); // Muestra un mensaje de éxito
      navigate('/');         // Redirige al inicio o página de login
    } else {
      toast.error('Error logging out'); // Si no fue exitoso
    }
  } catch (error) {
    console.error('Logout error:', error);  // Imprime el error en la consola
    toast.error(error?.response?.data?.message || 'Error during logout'); // Muestra el error del backend
  }
};


  // Función para manejar la verificación de correo
  const sendVerifiOTP = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);

      if (data.success) {
        navigate('/email-verify')
        toast.success(data.message +' Verification email sent!');
      } else {
        toast.error(data.message || 'Error sending verification email');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error during logout');
    
    }
  };

  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
      <img src={assets.logo} alt="logo" className='w-28 sm:w-32' />

      {userData ? (
        <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group'>
          {/* Mostrar la primera letra del nombre del usuario */}
          {userData.name.charAt(0).toUpperCase()}
          
          {/* Menú desplegable al hacer hover */}
          <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
            <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
              {/* Mostrar la opción de "Verify email" solo si el usuario no tiene la cuenta verificada */}
              {!userData.isAccountVerified && (
                <li onClick={sendVerifiOTP} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>
                  Verify email
                </li>
              )}

              {/* Opción para cerrar sesión */}
              <li onClick={logout} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all'
        >
          Login
          <img src={assets.arrow_icon} alt="Flecha" />
        </button>
      )}
    </div>
  );
};

export default Navbar;

