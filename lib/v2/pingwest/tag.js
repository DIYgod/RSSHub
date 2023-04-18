const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { tag, type, option } = ctx.params;
    const needFullText = option === 'fulltext';

    const baseUrl = 'https://www.pingwest.com';
    const tagUrl = `${baseUrl}/tag/${tag}`;
    const { tagId, tagName } = await ctx.cache.tryGet(`pingwest:tag:${tag}`, async () => {
        const res = await got(tagUrl, {
            headers: {
                Referer: baseUrl,
            },
        });
        const $ = cheerio.load(res.data);
        const tagId = $('.tag-detail').attr('data-id');
        const tagName = $('.tag-detail .info .title').text();
        return { tagId, tagName };
    });

    const url = `${baseUrl}/api/tag_article_list`;
    const response = await got(url, {
        searchParams: {
            id: tagId,
            type: type - 1,
        },
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = cheerio.load(response.data.data.list);
    const items = await utils.articleListParser($, needFullText, ctx.cache);

    ctx.state.data = {
        title: `品玩 - ${tagName}`,
        description: `品玩 - ${tagName}`,
        link: tagUrl,
        item: items,
    };
};
