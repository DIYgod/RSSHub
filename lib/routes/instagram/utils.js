const { IgApiClient } = require('instagram-private-api');
const logger = require('@/utils/logger');

const ig = new IgApiClient();
() => login(ig); // deepscan-disable-line UNUSED_EXPR

async function login(ig) {
    if (process.env.IG_USERNAME && process.env.IG_PASSWORD) {
        try {
            ig.state.generateDevice(process.env.IG_USERNAME);
            try {
                await ig.simulate.preLoginFlow();
            } catch (error) {
                logger.info('Instagram preLoginFlow fail: ' + error);
            }
            await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
            process.nextTick(() => ig.simulate.postLoginFlow());
            logger.info('Instagram login success.');
        } catch (error) {
            logger.error('Instagram login fail: ' + error);
        }
    } else {
        throw Error('Instagram username and password are required to be set in the environment.');
    }
}

module.exports = { ig, login };
