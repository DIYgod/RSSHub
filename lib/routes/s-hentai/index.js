const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id || 'ready-to-download';

    const rootUrl = 'https://s-hentai.org';
    const currentUrl = `${rootUrl}/${id === 'ready-to-download' ? id : `menu/${id}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.block-product')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .map((_, item) => {
            item = $(item);

            const a = item.find('.name-product a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(item.find('.post-date').text().trim().split(' ')[0], 'YYYY年MM月DD日'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                const images = content('#sync1');
                const description = content('#description-deital');

                content('.single-support').remove();

                item.enclosure_url = content('.file-download-comment a').eq(0).attr('href');
                item.enclosure_type = 'application/x-bittorrent';

                item.description = (images ? images.html() : '') + content('.detial-short').html() + (description ? description.html() : '');
                item.category = detailResponse.data.match(/<a href="https:\/\/s-hentai\.org\/category\/\d+">(.*)<\/a>/g).map((category) => category.match(/>(.*)</)[1]);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('title').text().trim().split('|')[0]} | S-HENTAI.ORG`,
        link: currentUrl,
        item: items,
    };
};
