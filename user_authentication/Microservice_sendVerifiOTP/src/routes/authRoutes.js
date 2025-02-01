import express from 'express';
import {sendVerifiOTP, } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/send-verify-otp', userAuth, sendVerifiOTP);

export default authRouter;
