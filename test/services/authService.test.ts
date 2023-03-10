jest.mock('../../database/models/index.js');
import { User } from '../../database/models/index.js';

jest.mock('bcrypt');
import bcrypt from 'bcrypt';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

jest.mock('jsonwebtoken');
import jwt from 'jsonwebtoken';
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

jest.mock('../../src/utils/redisUtil');
import * as redisUtil from '../../src/utils/redisUtil';
const mockedRedisUtil = redisUtil as jest.Mocked<typeof redisUtil>;

import authService from '../../src/services/authService';

const dummyUserObject = {
  name: 'a',
  username: 'a',
  password: 'abc'
};

const dummyUserObjectCreated = {
  name: 'a',
  username: 'a',
  id: 1
};

describe('Auth Service', () => {
  describe('add', () => {
    it('should call create object in db by using create method of model', async () => {
      jest.spyOn(User, 'create')
        .mockImplementation(async () => {return;})
        .mockResolvedValue(dummyUserObjectCreated);

      await authService.add(dummyUserObject);
      expect(User.create).toBeCalled();
    });
  });

  describe('validateAndGetToken', () => {
    it('should call jwt sign if password and username match and set token in redis', async () => {
      mockedJwt.sign = jest.fn();
      mockedBcrypt.compare = jest.fn().mockResolvedValue(true);
      
      Object.defineProperty(mockedRedisUtil, 'setAuthToken', {
        value: jest.fn().mockImplementation(() => { return; }),
        writable: true
      });

      authService.getByUsername = jest.fn().mockResolvedValue(dummyUserObjectCreated);

      await authService.validateAndGetToken('a', 'b');
      expect(authService.getByUsername).toBeCalled();
      expect(mockedBcrypt.compare).toBeCalled();
      expect(mockedJwt.sign).toBeCalled();
      expect(mockedRedisUtil.setAuthToken).toBeCalled();
    });

    it('should throw server error when wrong password given', async () => {
      mockedJwt.sign = jest.fn();
      mockedBcrypt.compare = jest.fn().mockResolvedValue(false);
      
      authService.getByUsername = jest.fn().mockResolvedValue(dummyUserObjectCreated);

      await expect(authService.validateAndGetToken('a', 'b')).rejects.toThrow();
    });
  });
});