import express from 'express';
import {  verifiEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/verify-account', userAuth, verifiEmail);

export default authRouter;
