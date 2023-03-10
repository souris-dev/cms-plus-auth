import express, { Router } from 'express';
import { loginController, tokenValidationController, createUserController } from '../controllers/authController';
const userRouter: Router = express.Router();

userRouter.post('/user', createUserController);
userRouter.post('/login', loginController);
userRouter.post('/token/validate', tokenValidationController);

export default userRouter;
