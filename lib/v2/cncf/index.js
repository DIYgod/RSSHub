const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootURL = 'https://www.cncf.io';

module.exports = async (ctx) => {
    const cate = ctx.params.cate ?? 'blog';
    const url = `${rootURL}/${cate}/`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const title = $('h1.is-style-page-title').text();
    const list = $('div.post-archive__item')
        .map((_index, item) => ({
            title: $(item).find('span.post-archive__title').text().trim(),
            link: $(item).find('span.post-archive__title > a').attr('href'),
            pubDate: parseDate($(item).find('span.post-archive__item_date').text().split('|')[0]),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                content('div.post-author').remove();
                content('div.social-share').remove();

                item.description = content('article').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `CNCF - ${title}`,
        link: url,
        item: items,
    };
};
