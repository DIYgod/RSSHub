const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `${utils.baseUrl}/collection/${id}.html`;
    const { data: response } = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response);

    const initialState = utils.parseInitialState($);

    const { collectionDetail } = initialState.collectionDetail;
    const list = collectionDetail.article_list.datalist.map((e) => ({
        title: e.title,
        link: `${utils.baseUrl}/article/${e.aid}.html`,
        description: e.summary,
        pubDate: parseDate(e.dateline, 'X'),
        author: e.user_info.username,
    }));

    const items = await utils.ProcessFeed(list, ctx.cache);

    const info = `虎嗅 - ${collectionDetail.name}`;

    ctx.state.data = {
        title: info,
        description: collectionDetail.summary,
        image: collectionDetail.icon,
        link,
        item: items,
    };
};
