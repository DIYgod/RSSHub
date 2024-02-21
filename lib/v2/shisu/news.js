const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const url = 'https://news.shisu.edu.cn/news/index.html';

module.exports = async (ctx) => {
    const { data: res } = await got(String(url));
    const $ = cheerio.load(res);
    const itemsoup = $('#gallery-wrapper > article')
        .toArray()
        .map((i0) => {
            const i = $(i0);
            return {
                title: i.find('a').text(),
                link: `${url}${i.find('a').attr('href')}`,
                pubDate: timezone(parseDate(i.find('.in-con02 > span:nth-child(2)').text(), 'YYYY-MM-DD'), +8),
                description: i.find('.default-txt').text(),
                language: 'zh-cn',
                image: i.find('img').attr('src').text(),
                icon: 'https://www.shisu.edu.cn/assets/images/sisu.ico',
                category: i.find('.in-con02 > span:nth-child(1)').text(),
            };
        });

    const items = await Promise.all(
        itemsoup.map((j) =>
            ctx.cache.tryGet(j.link, async () => {
                const { data: res } = await got(j.link);
                const $ = cheerio.load(res);
                j.description = $('.ot_main_r').html();
                return j;
            })
        )
    );

    ctx.state.data = {
        title: '上外新闻|SISU TODAY',
        link: url,
        item: items,
    };
};
