const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'http://www.cnu.cc/selectedPage';

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const list = $('.selectedUL > .bannerLi').toArray();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.workTitle');
            const link = title.parent().attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const rssitem = {
                title: title.text().trim(),
                link,
            };

            try {
                const response = await got.get(link);
                const result = utils.parseContent(response.data);
                if (!result.description) {
                    return '';
                }

                rssitem.author = result.author;
                rssitem.description = result.description;
                rssitem.pubDate = result.pubDate;
            } catch {
                return '';
            }
            ctx.cache.set(link, JSON.stringify(rssitem));
            return rssitem;
        })
    );

    ctx.state.data = {
        title: `CNU视觉联盟 - 每日精选`,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
