import userModel from '../models/userModel.js';

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
