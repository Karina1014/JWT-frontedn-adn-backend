import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Verificar si los campos son proporcionados
  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing details' });
  }

  // Validación de la contraseña: debe tener al menos 8 caracteres
  if (password.length < 8) {
    return res.json({ success: false, message: 'Password must be at least 8 characters long' });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    // Generar el token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Establecer la cookie con el token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Enviar el correo de bienvenida
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to Karina',
      text: `Welcome to Karina's website. Your account has been created with email ID: ${email}`
    };
    
    await transporter.sendMail(mailOption);

    // Devolver respuesta de éxito
    return res.json({ success: true, message: 'User registered successfully' });

  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};
