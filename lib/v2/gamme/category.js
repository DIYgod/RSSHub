const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const { domain = 'news', category } = ctx.params;
    const baseUrl = `https://${domain}.gamme.com.tw`;
    const feed = await parser.parseURL(`${baseUrl + (category ? `/category/${category}` : '')}/feed`);

    await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = cheerio.load(data);

                $('.entry img').each((_, img) => {
                    if (img.attribs['data-original'] || img.attribs['data-src']) {
                        img.attribs.src = img.attribs['data-original'] || img.attribs['data-src'];
                        delete img.attribs['data-original'];
                        delete img.attribs['data-src'];
                    }
                });

                item.author = $('.author_name').text().trim();
                item.category = $('.tags a')
                    .toArray()
                    .map((tag) => $(tag).text());
                $('.social_block, .tags').remove();
                item.description = $('.entry').html();

                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        image: domain === 'news' ? `${baseUrl}/blogico.ico` : `${baseUrl}/favicon.ico`,
        description: feed.description,
        item: feed.items,
    };
};
