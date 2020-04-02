const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
require('dayjs/locale/zh-cn');

module.exports = async (ctx) => {
    const res = await got({ method: 'get', url: 'http://tv.cctv.com/lm/xwlb/' });
    const $ = cheerio.load(res.data);
    // 解析最新一期新闻联播的日期
    const latestDate = dayjs(date($('.md .mh_title > a').text().replace(/\s/g, '')), { locale: 'zh-cn' });
    const count = [];
    for (let i = 0; i < 20; i++) {
        count.push(i);
    }
    const resultItems = await Promise.all(
        count.map(async (i) => {
            const newsDate = latestDate.subtract(i, 'days').set('hour', 19);
            const url = `http://tv.cctv.com/lm/xwlb/day/${newsDate.format('YYYYMMDD')}.shtml`;
            const item = {
                title: `新闻联播 ${newsDate.format('YYYY/MM/DD')}`,
                link: url,
                pubDate: newsDate.toISOString(),
                description: await ctx.cache.tryGet(url, async () => {
                    const res = await got.get(url);
                    const content = cheerio.load(res.data);
                    const alist = new Array();
                    content('a').map((i, e) => {
                        const a = content(e);
                        const href = a.attr('href');
                        const title = a.find('.text .title').text();
                        const dur = a.find('.text .bottom').text();
                        alist.push(`<a href="${href}">${title} ⏱${dur}</a>`);
                        return i;
                    });
                    return alist.join('<br/>\n');
                }),
            };
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: 'CCTV 新闻联播',
        link: 'http://tv.cctv.com/lm/xwlb/',
        item: resultItems,
    };
};
