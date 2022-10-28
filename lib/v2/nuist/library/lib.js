const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseTitle = '南京信息工程大学图书馆通知';
const baseUrl = 'https://lib.nuist.edu.cn';

module.exports = async (ctx) => {
    const link = baseUrl + '/index/tzgg.htm';

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.list2 li')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('a').attr('title'),
                category: '通知',
                link: new URL(item.find('a').attr('href'), link).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                item.description = $('#vsb_content').html();
                item.pubDate = parseDate($('.date').find('span').eq(0).text(), 'YYYY年MM月DD日');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: baseTitle,
        link,
        item: items,
    };
};
