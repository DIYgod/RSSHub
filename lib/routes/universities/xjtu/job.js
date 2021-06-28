const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const subpath = ctx.params.subpath || 'zxtg';
    const arr = {
        zxtg: '中心通告',
        xdsgwy: '选调生|公务员',
        gjzzsx: '国际组织实习',
        xwzx: '新闻资讯',
        hdyjz: '活动与讲座',
    };
    const rootUrl = `https://job.xjtu.edu.cn/news.do;?ext=${arr[subpath]}`;
    const baseUrl = 'https://job.xjtu.edu.cn';

    const list_response = await got.get(rootUrl);
    const $ = cheerio.load(list_response.data);

    const list = $('div.jsnr ul li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.find('span').text(),
                link: new URL(a.attr('href'), baseUrl),
            };
        })
        .get();

    ctx.state.data = {
        title: `西安交通大学就业网-${arr[subpath]}`,
        link: baseUrl,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const res = await got.get(item.link);
                        const content = cheerio.load(res.data);
                        item.description = content('div.jsnr').html();
                        const dateStr = content('div.jsnrly span').eq(1).text();
                        const date = parseDate(dateStr, 'YYYY MM DD HH mm', 'zh-cn');
                        item.pubDate = timezone(date, +8);
                        return item;
                    })
            )
        ),
    };
};
