import logger from '~/utils/logger';
import {createCommons} from 'simport';

const {
    require
} = createCommons(import.meta.url);

const config = require('~/config').value;
const Fanfou = require('fanfou-sdk');

const consumerKey = config.fanfou.consumer_key;
const consumerSecret = config.fanfou.consumer_secret;
const {
    username,
    password
} = config.fanfou;

let fanfou_client;
let authed = false;

const getFanfou = async () => {
    if (authed) {
        return fanfou_client;
    } else {
        fanfou_client = new Fanfou({
            consumerKey,
            consumerSecret,
            username,
            password,
            protocol: 'https:',
            hooks: {
                baseString(str) {
                    return str.replace('https', 'http');
                },
            },
        });

        await fanfou_client.xauth();
        logger.info('Fanfou login success.');

        authed = true;
        return fanfou_client;
    }
};

export default {
    getFanfou,
};
