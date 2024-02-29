const got = require('@/utils/got');
const cheerio = require('cheerio');

const { RUBY_CHINA_HOST } = require('./constants');
const utils = require('./utils');

module.exports = async (ctx) => {
    const title = 'Ruby China - 招聘';
    const link = `${RUBY_CHINA_HOST}/jobs`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.topics .topic').get();

    const result = await utils.processTopics2Feed(list, ctx.cache);

    ctx.state.data = {
        title,
        link,
        description: title,
        item: result,
    };
};
