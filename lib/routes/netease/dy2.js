const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `https://www.163.com/dy/media/${id}.html`;

    const response = await got.get(url, { responseType: 'buffer' });

    const charset = response.headers['content-type'].split('=')[1];
    const data = iconv.decode(response.data, charset);
    const $ = cheerio.load(data, { decodeEntities: false });

    const list = $('.media_articles ul li')
        .slice(0, 5)
        .map((_, item) => {
            item = $(item);
            const a = item.find('h2.media_article_title a');
            let pubDate = item.find('.media_article_date').text();
            pubDate = new Date(pubDate).toUTCString();
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate,
            };
        })
        .get();

    let link;

    const items = await Promise.all(
        list.map(async (item) => {
            const itemData = await ctx.cache.tryGet(
                item.link,
                () =>
                    got.get(item.link, {
                        responseType: 'buffer',
                    }).data
            );
            const content = cheerio.load(itemData, { decodeEntities: false });

            const eDescription = content('.post_body').html();

            const single = {
                title: item.title,
                link: item.link,
                description: eDescription,
                pubDate: item.pubDate,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: $('.media_info h1').text(),
        link,
        description: '',
        item: items,
    };
};
