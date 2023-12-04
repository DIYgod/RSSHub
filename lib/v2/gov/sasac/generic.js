const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { path } = ctx.params;
    const baseUrl = 'http://www.sasac.gov.cn';
    const url = `${baseUrl}/${path}/index.html`;
    const response = await got(url);

    const $ = cheerio.load(response.data);
    const list = $('.zsy_conlist li')
        .toArray()
        .filter((item) => !$(item).attr('style'))
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), response.url).href,
                pubDate: parseDate(item.find('span').text().replace('[', '').replace(']', '')),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                $('style, #qr_container, #div_div, [class^=jiathis]').remove();
                item.description = $('.zsy_comain').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text().trim(),
        link: url,
        image: 'http://www.sasac.gov.cn/dbsource/11869722/11869731.jpg',
        item: items,
    };
};
