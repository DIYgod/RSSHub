const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);

        $('.contents-body h3').remove();
        const time = $('.meta-info .time').text().trim();
        $('.meta-info').remove();
        const content = $('.contents-body');

        return {
            description: content.html(),
            pubDate: new Date(time),
        };
    };

    const response = await got({
        method: 'get',
        url: 'https://priconne-redive.jp/news/',
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.article_box');

    const out = await Promise.all(
        list.map(async (index, item) => {
            item = $(item);
            const link = item.find('a').first().attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const rssitem = {
                title: item.find('h4').text(),
                link,
            };

            try {
                const response = await got(link);
                const result = parseContent(response.data);

                rssitem.description = result.description;
                rssitem.pubDate = result.pubDate;

                ctx.cache.set(link, JSON.stringify(rssitem));
                return rssitem;
            } catch {
                return '';
            }
        })
    );

    ctx.state.data = {
        title: '公主链接日服-新闻',
        link: 'https://priconne-redive.jp/news/',
        language: 'ja',
        item: out,
    };
};
