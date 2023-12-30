const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
// const UA = require('@/utils/rand-user-agent')({ browser: 'chrome', os: 'windows', device: 'desktop' });
const noticeUrl = 'https://www.teach.ustc.edu.cn/category/notice';
const noticeType = { teaching: '教学', info: '信息', exam: '考试', exchange: '交流' };

module.exports = async (ctx) => {
    const type = ctx.params.type ?? '';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',

        /* headers: {
            'user-agent': UA,
        }, */
        url: `${noticeUrl}${type === '' ? '' : '-' + type}`,
    });

    const $ = cheerio.load(response.data);
    let items = $(type === '' ? 'ul[class="article-list with-tag"] > li' : 'ul[class=article-list] > li')
        .map(function () {
            const child = $(this).children();
            const info = {
                title: type === '' ? $(child[0]).find('a').text() + ' - ' + $(child[1]).find('a').text() : $(child[0]).find('a').text(),
                link: type === '' ? $(child[1]).find('a').attr('href') : $(child[0]).find('a').attr('href'),
                pubDate: timezone(parseDate($(this).find('.date').text().trim(), 'YYYY-MM-DD'), +8),
            };
            return info;
        })
        .get();

    items = await Promise.all(
        items
            .filter((item) => item.link)
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);
                    // www.teach ?? pms.cmet ?? news
                    item.description = $('main[class=single]').html() ?? $('.card-footer').html() ?? $('.v_news_content').html();
                    item.pubDate = $('li[class=meta-date]').text() ? timezone(parseDate($('li[class=meta-date]').text(), 'YYYY-MM-DD HH:mm'), +8) : item.pubDate;
                    return item;
                })
            )
    );

    const desc = type === '' ? '中国科学技术大学教务处 - 通知新闻' : `中国科学技术大学教务处 - ${noticeType[type]}类通知`;

    ctx.state.data = {
        title: desc,
        description: desc,
        link: `${noticeUrl}${type === '' ? '' : '-' + type}`,
        item: items,
    };
};
