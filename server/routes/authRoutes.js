import express from 'express';
import { register, login, logout, sendVerifiOTP, verifiEmail, sendResetOtp, resetPassword, isAuthenticated } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

// Define las rutas
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifiOTP);
authRouter.post('/verify-account', userAuth, verifiEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);


// Exporta el router correctamente
export default authRouter;
