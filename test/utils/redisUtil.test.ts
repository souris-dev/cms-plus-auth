import * as redis from 'redis';
jest.mock('redis');
const mockRedis = redis as jest.Mocked<typeof redis>;

const createClientMock = mockRedis.createClient as jest.Mock;

const dummyRedisClient = {
  on: jest.fn(),
  connect: jest.fn(async () => { return; }),
  set: jest.fn(async () => { return; }),
  get: jest.fn(async () => { return; })
};

createClientMock.mockReturnValue(dummyRedisClient);

import { setAuthToken, getAuthToken } from '../../src/utils/redisUtil';

describe('Redis Util', () => {
  it('should call createClient with required options and connect to it', () => {
    expect(createClientMock).toBeCalled();
    expect(dummyRedisClient.on).toBeCalled();
    expect(dummyRedisClient.connect).toBeCalled();
  });

  describe('setAuthToken', () => {
    it('should call redis client set method with appropriate arguments when userId is defined', async () => {
      await setAuthToken('abc', 1);
      expect(dummyRedisClient.set).toBeCalledWith('token1', 'abc');
    });

    it('should call redis client set method with appropriate arguments when userId is not defined', async () => {
      await setAuthToken('abc');
      expect(dummyRedisClient.set).toBeCalledWith('token', 'abc');
    });
  });

  describe('getAuthToken', () => {
    it('should call redis client get method with appropriate arguments', async () => {
      await getAuthToken(1);
      expect(dummyRedisClient.get).toBeCalledWith('token1');
    });
  });
});