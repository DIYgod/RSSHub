const Twit = require('twit');
const config = require('@/config');
const utils = require('./utils');
const logger = require('@/utils/logger');

const T = new Twit(config.twitter);

module.exports = async (ctx) => {
    const result = await T.get('statuses/home_timeline', {
        tweet_mode: 'extended',
        count: 100,
    });
    const data = result.data;
    logger.info(data);

    ctx.state.data = {
        title: `Twitter 个人时间线`,
        link: `https://twitter.com`,
        description: data[0].user.description,
        item: utils.ProcessFeed({
            data,
        }),
    };
};
