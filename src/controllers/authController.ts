import express from 'express';
import userService, { UserObject } from '../services/authService';
import { ServerError } from '../utils/errors';

export const createUserController = async (req: express.Request, 
  res: express.Response) => {
  try {
    const userObject: UserObject = req.body;
    const userObjectCreated = await userService.add(userObject);

    res.status(201);
    res.json(userObjectCreated);
  } catch (err: any) {
    res.status(500);
    res.json({ error: err });
  }
};

interface UserLoginInfo {
  username: string,
  password: string
}

export const loginController = async (req: express.Request, res: express.Response) => {
  try {
    const userLoginInfo: UserLoginInfo = req.body;
    const jwtSigned = await userService.validateAndGetToken(userLoginInfo.username, userLoginInfo.password);

    res.status(200);
    res.json({ jwt: jwtSigned });
  } catch(err: any) {
    res.status(err.code ?? 500);
    res.json({ error: err.message ?? err });
  }
};

export const tokenValidationController = async (req: express.Request, res: express.Response) => {
  const token: string | undefined = req.header('authorization')?.split(' ')[1];

  if (token === undefined) {
    throw new ServerError('No bearer token found in header (in Authorization header).', 400);
  }

  try {
    const jwtDecoded = await userService.checkValidity(token);
    res.status(200);
    res.json(jwtDecoded);
  } catch(err: any) {
    res.status(err.code ?? 500);
    res.json({ error: err.message ?? 'Internal server error.' });
  }
};
