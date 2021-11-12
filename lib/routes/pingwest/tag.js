const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { tag, type } = ctx.params;
    const baseUrl = 'https://www.pingwest.com';
    const tagUrl = `${baseUrl}/tag/${tag}`;
    const tagId = await ctx.cache.tryGet(`pingwest-tag-${tag}`, async () => {
        const res = await got(encodeURI(tagUrl), {
            headers: {
                Referer: baseUrl,
            },
        });
        const $ = cheerio.load(res.data);
        const tagId = $('.tag-detail').attr('data-id');
        return tagId;
    });
    const url = `${baseUrl}/api/tag_article_list`;
    const response = await got(url, {
        searchParams: {
            page: 1,
            id: tagId,
            type,
        },
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data.data.list);
    const items = $('.item')
        .map((_, ele) => {
            const className = ele.attribs.class;
            if (className.includes('state')) {
                return utils.statusListParser(cheerio.load(ele))[0];
            }
            if (className.includes('wire')) {
                return utils.wireListParser(cheerio.load(ele))[0];
            }
            return utils.articleListParser(cheerio.load(ele))[0];
        })
        .get();

    ctx.state.data = {
        title: `品玩 - ${tag}`,
        description: `品玩 - ${tag}`,
        link: tagUrl,
        item: items,
    };
};
