import exprees from 'express'
import userAuth from '../middleware/userAuth.js';
import { getUserData } from '../controllers/userController.js';

const userRoutes = exprees.Router();

userRoutes.get('/data', userAuth, getUserData)

export default userRoutes;