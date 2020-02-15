const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://z-z-z.vip');
    const $ = cheerio.load(response.data);
    const list = $('.posts-wrapper article').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('.nv-content-wrap.entry-content');

        return content.html();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('.blog-entry-title a');
            const link = $a.attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const single = {
                title: $a.text(),
                description: ProcessFeed(response.data),
                link: link,
                pubDate: new Date($('time.published').attr('datetime')).toUTCString(),
                author: $('.author-name > a').text(),
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '紫竹张先生',
        link: 'https://z-z-z.vip',
        description: '紫竹张先生',
        item: items,
    };
};
