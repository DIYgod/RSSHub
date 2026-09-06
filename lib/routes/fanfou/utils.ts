import Fanfou from 'fanfou-sdk';

import { config } from '@/config';
import logger from '@/utils/logger';

let fanfouClient: Fanfou;
let authed = false;

export const getFanfou = async () => {
    if (authed) {
        return fanfouClient;
    }

    fanfouClient = new Fanfou({
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

    authed = true;
    return fanfouClient;
};
