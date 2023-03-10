import { User } from '../../database/models/index.js';
import { ResourceNotFoundError, ServerError } from '../utils/errors';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getAuthToken, setAuthToken } from '../utils/redisUtil';

const JWT_SECRET = process.env.JWT_SECRET || 'jaydoublewtee';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '5h';

export interface UserObject {
  name: string,
  username: string,
  password: string,
  id? : number
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
      userId: number,
      username: string
  }
}

export interface IAuthService {
  validateAndGetToken: (username: string, password: string) => Promise<string>,
  checkValidity: (token: string) => Promise<JwtPayload>
}

class UserAuthService implements IAuthService {
  async add(userObject: UserObject): Promise<UserObject> {
    const nSaltOrRounds = 10;

    userObject.password = await bcrypt.hash(userObject.password, nSaltOrRounds);
    const userCreatedObj = await User.create(userObject);
    userCreatedObj.password = '';

    return userCreatedObj;
  }

  async validateAndGetToken(username: string, password: string): Promise<string> {
    const userObj: UserObject = await this.getByUsername(username);
    const isPasswordOk: boolean = await bcrypt.compare(password, userObj.password);

    if (!isPasswordOk) {
      throw new ServerError('Invalid username/password', 401);
    }

    const jwtSigned = jwt.sign({ 
      username: userObj.username,
      userId: userObj.id
    }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    if (userObj.id) {
      await setAuthToken(jwtSigned, userObj.id);
    }

    return jwtSigned;
  }

  async checkValidity(token: string): Promise<JwtPayload> {
    const jwtDecoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const storedToken = await getAuthToken(jwtDecoded.userId);
    if (storedToken !== token) {
      throw new ServerError('Provided JWT token does not match with the token previously created.', 401);
    }

    return jwtDecoded;
  }

  async getByUsername(username: string): Promise<UserObject> {
    const user = await User.findOne({
      where: {
        username: username
      }
    });

    if (!user) {
      throw new ResourceNotFoundError(`User with username ${username} not found.`);
    }

    return {
      id: user.id,
      name: user.name,
      password: user.password,
      username: user.username
    };
  }

  async getById(userId: number): Promise<UserObject> {
    const user = await User.findOne({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new ResourceNotFoundError(`User with ID ${userId} not found.`);
    }

    return {
      id: user.id,
      password: user.password,
      name: user.name,
      username: user.username
    };
  }
}

export default new UserAuthService();