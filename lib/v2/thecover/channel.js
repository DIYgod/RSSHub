const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const rootUrl = 'https://www.thecover.cn';

const nodes = {
    3892: '天下',
    3560: '四川',
    3909: '辟谣',
    3686: '国际',
    11: '云招考',
    3902: '30秒',
    3889: '拍客',
    3689: '体育',
    1: '国内',
    4002: '帮扶铁军',
    12: '文娱',
    46: '宽窄',
    4: '商业',
    21: '千面',
    17: '封面号',
};

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '3892';
    const targetUrl = rootUrl.concat(`/channel_${id}`);
    const resp = await got({
        method: 'get',
        url: targetUrl,
    });
    const $ = cheerio.load(resp.data);
    const list = $('a.link-to-article')
        .filter(function () {
            return $(this).attr('href').startsWith('/');
        })
        .map((_, item) => ({
            link: rootUrl.concat($(item).attr('href')),
        }))
        .get();
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);
                item.title = content('h1', '.main-article').text();
                item.description = content('section.article-content').html();
                const info = content('span', '.props-of-title');
                item.author = info.eq(0).text();
                item.pubDate = timezone(parseDate(info.eq(1).text(), 'YYYY-MM-DD HH:mm'), +8);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${nodes[id]}-封面新闻`,
        link: targetUrl,
        description: `封面新闻作为华西都市报深度融合转型和打造新型主流媒体的载体，牢固确立移动优先战略，创新移动新闻产品，打造移动传播矩阵，封面新闻的传播力、引导力、影响力和公信力不断得到各方肯定。封面新闻突破千万的用户下载量，呈现出以四川为主阵地的全国分布态势，用户年龄构成以20-35岁为主，“亿万年轻人的生活方式”的定位初步得到体现。`,
        language: 'zh-cn',
        item: items,
    };
};
