const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://bjwb.seiee.sjtu.edu.cn';

module.exports = function (meta, extract) {
    return async (ctx) => {
        const { title, local, author } = meta(ctx);

        const link = new URL(local, host).href;
        const response = await got(link);

        const list = extract(cheerio.load(response.data));

        const out = await Promise.all(
            list.map((item) => {
                const itemUrl = new URL(item.link, host).href;
                return ctx.cache.tryGet(itemUrl, async () => {
                    const response = await got(itemUrl);
                    const $ = cheerio.load(response.data);

                    return {
                        title: item.title,
                        link: itemUrl,
                        author,
                        description: $('.article_content').html(),
                        pubDate: parseDate(item.date, 'YYYY-MM-DD'),
                    };
                });
            })
        );

        ctx.state.data = {
            title,
            link,
            item: out,
        };
    };
};
