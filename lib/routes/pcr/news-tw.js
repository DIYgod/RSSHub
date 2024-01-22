const got = require('@/utils/got');
const cheerio = require('cheerio');

const base = 'http://www.princessconnect.so-net.tw';

module.exports = async (ctx) => {
    const url = `${base}/news`;

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const list = $('.news_con dl dd').get();

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);

        $('.news_con h2 > span').remove();
        const time = $('.news_con h2').text().trim();
        $('.news_con section h4').first().remove();
        const content = $('.news_con section');

        return {
            description: content.html(),
            pubDate: new Date(time),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const title = $('a');
            const path = title.attr('href');

            const link = base + path;

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
                const result = parseContent(response.data);

                rssitem.author = '《超異域公主連結☆Re:Dive》營運團隊';
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
        title: '公主连结 - 台服公告',
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
