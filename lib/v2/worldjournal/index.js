const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseUrl = 'https://www.worldjournal.com';

module.exports = async (ctx) => {
    const { path = 'cate/breaking' } = ctx.params;
    const { data: response } = await got(`${baseUrl}/wj/${path}`);

    const $ = cheerio.load(response);

    const list = $('.subcate-list__wrapper .subcate-list__link__text')
        .toArray()
        .map((item) => {
            item = $(item);
            const url = item.find('a').first().attr('href');
            return {
                title: item.find('h3').text(),
                description: item.find('p').html(),
                link: url.includes('?from=') ? url.split('?from=')[0] : url,
                pubDate: timezone(parseDate(item.find('.subcate-list__time--roc').text(), 'YYYY-MM-DD HH:mm'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                $('[id^=div-gpt-ad], [class^=udn-ads-], .keywords, .next-page, .udn-ads, .article-content__ads--bd').remove();

                $('img').each((_, img) => {
                    if (img.attribs['data-src']) {
                        const url = new URL(img.attribs['data-src']);
                        if (url.pathname === '/gw/photo.php') {
                            img.attribs.src = url.searchParams.get('u');
                            delete img.attribs['data-src'];
                        }
                    }
                });

                item.description = $('.article-content__paragraph').html();
                item.categories = $('meta[name=news_keywords]').attr('content').split(',');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: 'https://www.worldjournal.com/static/img/icons/icon-144x144.png',
        link: `${baseUrl}/wj/${path}`,
        item: items,
    };
};
