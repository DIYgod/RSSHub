const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://z-z-z.vip');
    const $ = cheerio.load(response.data);
    const list = $('.media-list .az-article-wrapper').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('div.bpp-post-content');

        content.find('img').each((i, e) => {
            $(e).attr('src', $(e).attr('data-echo'));
        });

        return content.html();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('.media-heading a');
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
                pubDate: $('.glyphicon-calendar')
                    .toArray()[0]
                    .nextSibling.data.replace(/年|月/g, '-')
                    .replace('日', ''),
                author: $('.glyphicon-user').toArray()[0].nextSibling.data,
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
