const got = require('@/utils/got');
const cheerio = require('cheerio');
const asyncPool = require('tiny-async-pool');
const { parseDate } = require('@/utils/parse-date');

const firstDay = new Date('2020-01-01');
const baseUrl = 'http://www.biquge.info';
// 获取小说的最新章节列表
module.exports = async (ctx) => {
    const { id, limit = 10 } = ctx.params; // 小说id
    const pageUrl = new URL(`/${id}/`, baseUrl);

    const response = await got({
        method: 'get',
        url: pageUrl,
        // responseEncoding: 'gbk', //该配置项在 0.18版本中没有打包进去
    });
    const responseHtml = response.data;
    const $ = cheerio.load(responseHtml);
    const title = $('#info > h1').text();
    const description = $('#intro>p').eq(0).text();
    const cover_url = $('#fmimg>img').eq(0).attr('src');
    const nItems = $('dd', '#list>dl').length;
    const list = $('dd', '#list>dl').slice(-Number.parseInt(limit));
    const chapter_item = list
        .find('a')
        .map((i, e) => ({
            title: e.children[0].data,
            link: new URL(e.attribs.href, pageUrl),
            pubDate: parseDate(firstDay.getTime() + (nItems - Number.parseInt(limit) + i) * 1000 * 60 * 60 * 24),
        }))
        .get();

    const items = [];
    for await (const item of asyncPool(3, chapter_item, (item) =>
        ctx.cache.tryGet(item.link.href, async () => {
            const response = await got({
                method: 'get',
                url: item.link,
            });

            const responseHtml = response.data;
            const $ = cheerio.load(responseHtml);

            const description = $('#content').html();

            const single = {
                title: item.title,
                description,
                link: item.link,
                pubDate: item.pubDate,
            };
            return single;
        })
    )) {
        items.push(item);
    }

    ctx.state.data = {
        title: `笔趣阁 ${title}`,
        link: pageUrl.href,
        image: cover_url,
        description,
        item: items,
    };
};
