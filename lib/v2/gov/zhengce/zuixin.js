const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const baseUrl = 'http://www.gov.cn';

module.exports = async (ctx) => {
    const link = `${baseUrl}/zhengce/zuixin.htm`;
    const listData = await got(link);
    const $ = cheerio.load(listData.data);

    const list = $('.news_box .list li:not(.line)')
        .toArray()
        .map((elem) => {
            elem = $(elem);
            return {
                title: elem.find('h4 a').text(),
                link: new URL(elem.find('h4 a').attr('href'), baseUrl).href,
                pubDate: timezone(parseDate(elem.find('h4 .date').text()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const contentData = await got(item.link);
                const $ = cheerio.load(contentData.data);
                item.description = $('#UCAP-CONTENT').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '最新政策 - 中国政府网',
        link,
        item: items,
    };
};
