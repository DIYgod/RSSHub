const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.krankenkassen.de/dpa/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.news td a');

    const getContent = async (subLink) => {
        const cacheKey = `krankenkassen_${subLink}`;
        const cache = await ctx.cache.get(cacheKey);
        if (cache) {
            return JSON.parse(cache);
        }

        const articlePageRes = await got(subLink);
        const articleHtml = articlePageRes.data;
        const $ = cheerio.load(articleHtml);
        const pubDate = $('.untertitel').text();
        const description = $('#content p').text();
        const result = {
            pubDate,
            description,
            title: $('.titel').text(),
            link: subLink,
        };
        ctx.cache.set(cacheKey, JSON.stringify(result));
        return result;
    };

    const item = await Promise.all(
        list
            .slice(0, 30)
            .map((index, dom) => {
                dom = $(dom);
                const link = `https://www.krankenkassen.de/dpa/${dom.attr('href')}`;
                return getContent(link);
            })
            .get()
    );

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://www.krankenkassen.de/dpa/',
        description: '德国新闻社卫健新闻',
        item,
    };
};
