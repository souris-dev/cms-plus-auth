import { createClient, RedisClientOptions } from 'redis';

const redisConfig: RedisClientOptions = {
  socket: {
    host: process.env.REDIS_HOST || 'docker.for.mac.localhost',
    port: Number(process.env.REDIS_PORT) || 6379
  }
};

const client = createClient(redisConfig);

client.on('error', err => console.error('Redis Client Error', err));

(async () => await client.connect())();

export const setAuthToken = async (token: string, userId?: number) => {
  await client.set('token' + (userId ?? ''), token);
};

export const getAuthToken = async (userId: number): Promise<string | null> => {
  return await client.get('token' + userId);
};
