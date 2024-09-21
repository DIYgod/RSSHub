const got = require('@/utils/got');
const cheerio = require('cheerio');

const { RUBY_CHINA_HOST } = require('./constants');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { type } = ctx.params;

    let title = 'Ruby China';
    let link = `${RUBY_CHINA_HOST}/topics`;
    switch (type) {
        case 'excellent':
            title += ' - 精华贴';
            link += '/excellent';
            break;
        case 'popular':
            title += ' - 优质帖子';
            link += '/popular';
            break;
        case 'no_reply':
            title += ' - 无人问津';
            link += '/no_reply';
            break;
        case 'last_reply':
            title += ' - 最新回复';
            link += '/last_reply';
            break;
        case 'last':
            title += ' - 最新发布';
            link += '/last';
            break;
        default:
    }

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
