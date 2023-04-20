const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const host = 'https://it.ouc.edu.cn';
    const typelist = ['学院要闻', '学院公告', '学术活动'];
    const urlList = ['xyyw/list.psp', 'xygg/list.psp', 'xshd/list.psp'];
    const type = parseInt(ctx.params.type) || 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);
    const $ = cheerio.load(response.data);

    const list = $('.col_news_list .news_list li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), host).href,
                pubDate: parseDate(e.find('span').text(), 'YYYY-MM-DD'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                item.author = '中国海洋大学信息科学与工程学院';
                item.description = $('.wp_articlecontent').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `中国海洋大学信息科学与工程学院${typelist[type]}`,
        link,
        item: out,
    };
};
