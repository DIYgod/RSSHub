const { IgApiClient } = require('instagram-private-api');
const logger = require('@/utils/logger');

let ig;
if (process.env.IG_USERNAME && process.env.IG_PASSWORD) {
    (async () => {
        try {
            ig = new IgApiClient();

            ig.state.generateDevice(process.env.IG_USERNAME);
            await ig.simulate.preLoginFlow();
            await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
            logger.info('Instagram login success.');
        } catch (error) {
            logger.error('Instagram login fail: ' + error);
        }
    })();
}

module.exports = ig;
