const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseUrl = 'https://www.famitsu.com';

module.exports = async (ctx) => {
    const { category = 'new-article' } = ctx.params;
    const url = `${baseUrl}/search/?category=${category}`;
    const { data } = await got(url);
    const $ = cheerio.load(data);

    const list = $('.col-12 .card__body')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.card__title').text(),
                link: new URL(item.find('.card__title a').attr('href'), baseUrl).href,
                pubDate: timezone(parseDate(item.find('time').attr('datetime'), 'YYYY.MM.DDTHH:mm'), +9),
            };
        })
        .filter((item) => item.link.startsWith('https://www.famitsu.com/news/'));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = cheerio.load(data);

                // remove ads
                $('.article-body__contents-pr-primary').remove();

                // fix header image
                $('.article-body div.media-image').each((_, e) => {
                    e.tagName = 'img';
                    e.attribs.src = e.attribs.style.match(/url\((.+?)\);/)[1];
                    delete e.attribs['data-src'];
                    delete e.attribs.style;
                });

                // remove white space
                $('.article-body__contents-img-block, .article-body__contents-img-common-col').each((_, e) => {
                    delete e.attribs.style;
                });

                item.description = $('.article-body').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: 'https://www.famitsu.com/img/1812/favicons/apple-touch-icon.png',
        link: url,
        item: items,
        language: 'ja',
    };
};
