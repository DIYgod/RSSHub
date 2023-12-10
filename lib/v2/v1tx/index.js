const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.v1tx.com';
    const { data: response } = await got(baseUrl);

    const $ = cheerio.load(response);
    const list = $('h2.entry-title a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                const data = JSON.parse($('script[type="application/ld+json"]').text());

                $('.entry-content figure > picture > source, noscript').remove();
                $('.entry-content img').each((_, img) => {
                    if (img.attribs.src.startsWith('data:')) {
                        img.attribs.src = img.attribs['data-lazy-src'];
                        delete img.attribs['data-lazy-src'];
                        delete img.attribs['data-lazy-srcset'];
                    }
                    img.attribs.src = img.attribs.src.replace(/-1024x\d+\.jpg/, '.webp').replace('.jpg', '.webp');
                    delete img.attribs.srcset;
                });

                item.pubDate = parseDate(data.datePublished);
                item.updated = parseDate(data.dateModified);
                item.description = $('.entry-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        image: `${baseUrl}/wp-content/uploads/2018/10/cropped-Favicon.webp`,
        item: items,
    };
};
