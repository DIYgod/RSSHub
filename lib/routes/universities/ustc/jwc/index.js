const got = require('@/utils/got');
const cheerio = require('cheerio');

const noticeUrl = 'https://www.teach.ustc.edu.cn/category/notice';
const noticeType = { teaching: '教学', info: '信息', exam: '考试', exchange: '交流' };

module.exports = async (ctx) => {
    const type = ctx.params.type || '';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
        },
        url: `${noticeUrl}${type === '' ? '' : '-' + type}`,
    });

    const $ = cheerio.load(response.data);
    const list = $(type === '' ? 'ul[class="article-list with-tag"] > li' : 'ul[class=article-list] > li')
        .map(function () {
            const child = $(this).children();
            const info = {
                title: type === '' ? $(child[0]).find('a').text() + ' - ' + $(child[1]).find('a').text() : $(child[0]).find('a').text(),
                link: type === '' ? $(child[1]).find('a').attr('href') : $(child[0]).find('a').attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list
            .filter((item) => item.link)
            .map(async (item) => {
                const itemUrl = item.link;
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);
                const single = {
                    title: item.title,
                    link: itemUrl,
                    description: $('main[class=single]').html(),
                    pubDate: new Date($('li[class=meta-date]').text()).toUTCString(),
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            })
    );

    const desc = type === '' ? '中国科学技术大学教务处 - 通知新闻' : `中国科学技术大学教务处 - ${noticeType[type]}类通知`;

    ctx.state.data = {
        title: desc,
        description: desc,
        link: `${noticeUrl}${type === '' ? '' : '-' + type}`,
        item: out,
    };
};
