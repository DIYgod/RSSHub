const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const { domain = 'news', tag } = ctx.params;
    if (!isValidHost(domain)) {
        throw new Error('Invalid domain');
    }
    const baseUrl = `https://${domain}.gamme.com.tw`;
    const pageUrl = `${baseUrl}/tag/${tag}`;

    const { data } = await got(pageUrl);
    const $ = cheerio.load(data);

    const list = $('#category_new li a, .List-4 h3 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title') || item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
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
                item.pubDate = parseDate($('.postDate').attr('content'));
                item.description = $('.entry').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${tag} | ${domain === 'news' ? '宅宅新聞' : '西斯新聞'}`,
        description: $('meta[name=description]').attr('content'),
        link: pageUrl,
        image: domain === 'news' ? `${baseUrl}/blogico.ico` : `${baseUrl}/favicon.ico`,
        item: items,
    };
};
