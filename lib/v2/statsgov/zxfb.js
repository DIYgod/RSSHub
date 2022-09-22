const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.stats.gov.cn';
    const url = `${rootUrl}/tjsj/zxfb/`;
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const list = $('ul.center_list_contlist li a:not([id])')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.cont_tit03').text(),
                link: new URL(item.attr('href'), `${rootUrl}/tjsj/zxfb/`).href,
                pubDate: parseDate($(item).find('.cont_tit02').text(), 'YYYY-MM-DD'),
            };
        })
        .filter((item) => item.title); // exclude the empty title

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const content = cheerio.load(response.data);
                const title = content('.xilan_titf').text();
                item.author = title.match(/来源：(.*)发布时间/)?.[1].trim() ?? '国家统计局';
                item.pubDate = timezone(parseDate(title.match(/发布时间：(.*)/)?.[1].trim() ?? item.pubDate), +8);
                item.description = content('.xilan_con').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '国家统计局 > 统计数据 > 最新发布',
        link: url,
        item: items,
    };
};
