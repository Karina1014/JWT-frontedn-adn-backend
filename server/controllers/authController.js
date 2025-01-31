import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing details' });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
    });

    //Sending welcome email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to Karina',
      text: `Welcome to Karina's website. Your account has been created with email ID: ${email}`
    };
    
       await transporter.sendMail(mailOption);
    //Sending welcome email fin

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: 'Invalid email',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
          });
        
          return res.json({succes:true,
            message:"Logged Out"
          })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Something went wrong. Please try again later.' });
  
    }

  }
// send verification OTP to the User's email
export const sendVerifiOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    // Verificar si la cuenta ya está verificada
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }

    // Generar OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;  // Se cambió de sendVerifiOTP a verifyOtp para que sea consistente con la validación en verifiEmail
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // Expira en 24 horas

    // Guardar cambios en la base de datos
    await user.save();

    // Configuración del correo
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      text: `Your OTP is ${otp}. Verify your account using this OTP.`
    };

    // Enviar el correo
    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Verification OTP sent to email" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

export const verifiEmail = async (req, res) => {
  const { userId, otp } = req.body;
  // Validar que se haya recibido el userId y otp
  if (!userId || !otp) {
    return res.json({ success: false, message: 'Missing Details' });
  }

  try {
    const user = await userModel.findById(userId);
    // Verificar si el usuario existe
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    // Verificar si el OTP es válido y coincide
    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }
    // Verificar si el OTP ha expirado
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP Expired' });
    }
    // Marcar la cuenta como verificada
    user.isAccountVerified = true;
    user.verifyOtp = '';  // Limpiar el OTP
    user.verifyOtpExpireAt = 0; // Resetear la fecha de expiración

    // Guardar los cambios en la base de datos
    await user.save();
    return res.json({ success: true, message: 'Email Verified Successfully' });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}
//Check if user authenticated
export const isAuthenticated = async (req, res) => {
  const token = req.cookies.token;  // Obtener el token desde las cookies

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Asignar el usuario decodificado al request
    return res.json({ success: true });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};


// Send Paswword Rest OTP
// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  // Validar que se haya recibido el email
  if (!email) {
    return res.json({ success: false, message: 'Email is required' });
  }

  try {
    // Buscar al usuario por el correo electrónico
    const user = await userModel.findOne({ email });

    // Verificar si el usuario existe
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Generar OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;  // Guardar el OTP en el campo resetOtp
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // Expira en 15 minutos

    // Guardar los cambios en la base de datos
    await user.save();

    // Configuración del correo
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`
    };

    // Enviar el correo
    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: 'OTP sent to email' });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

//Reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Validar que se haya recibido el email, OTP y la nueva contraseña
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: 'Email, OTP, and new password are required'
    });
  }

  try {
    // Buscar al usuario por email
    const user = await userModel.findOne({ email });

    // Verificar si el usuario existe
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Verificar si el OTP es válido
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    // Verificar si el OTP ha expirado
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP Expired' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    user.password = hashedPassword;
    user.resetOtp = '';  // Limpiar el OTP
    user.resetOtpExpireAt = 0;  // Resetear la fecha de expiración del OTP

    // Guardar los cambios en la base de datos
    await user.save();

    return res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}
