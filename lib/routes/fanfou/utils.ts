import Fanfou from 'fanfou-sdk';

import { config } from '@/config';
import logger from '@/utils/logger';

let authPromise: Promise<Fanfou> | undefined;

const createClient = async () => {
    const fanfouClient = new Fanfou({
        consumerKey: config.fanfou.consumer_key,
        consumerSecret: config.fanfou.consumer_secret,
        username: config.fanfou.username,
        password: config.fanfou.password,
        protocol: 'https:',
        hooks: {
            baseString: (str: string) => str.replace('https', 'http'),
        },
    });

    await fanfouClient.xauth();
    logger.info('Fanfou login success.');

    return fanfouClient;
};

const authenticateClient = async () => {
    try {
        return await createClient();
    } catch (error) {
        authPromise = undefined;
        throw error;
    }
};

export const getFanfou = () => {
    authPromise ??= authenticateClient();
    return authPromise;
};
