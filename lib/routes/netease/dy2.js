const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit || 5;
    const url = `https://www.163.com/dy/media/${id}.html`;

    const response = await got(url, { responseType: 'buffer' });

    const charset = response.headers['content-type'].split('=')[1];
    const data = iconv.decode(response.data, charset);
    const $ = cheerio.load(data, { decodeEntities: false });

    const list = $('.media_articles ul li')
        .slice(0, limit)
        .map((_, item) => {
            item = $(item);
            const a = item.find('h2.media_article_title a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(item.find('.media_article_date').text()),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            const itemData = await ctx.cache.tryGet(item.link, () =>
                got(item.link, {
                    responseType: 'buffer',
                }).then((it) => it.data)
            );
            const content = cheerio.load(itemData, { decodeEntities: false });
            const postBody = content('.post_body');
            postBody.find('p, br, section').each((_, elem) => elem.attribs && Object.keys(elem.attribs).forEach((attr) => content(elem).removeAttr(attr)));
            postBody
                .parent()
                .find('*')
                .contents()
                .filter((_, elem) => elem.type === 'comment')
                .remove();
            return {
                title: item.title,
                link: item.link,
                description: postBody.html(),
                pubDate: item.pubDate,
            };
        })
    );

    ctx.state.data = {
        title: $('.media_info h1').text(),
        link: url,
        description: $('.media_degist').text(),
        item: items,
        author: $('.media_name').text(),
    };
};
