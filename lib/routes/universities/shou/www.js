const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'https://www.shou.edu.cn';

async function GetDesc(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const description = $('.wp_articlecontent').text();
    return { description };
}

const ProcessFeed = async (list, caches) =>
    await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const itemUrl = url.resolve(host, $('a').attr('href'));

            const fetched = {
                title: $('.col_news_title').text().trim(),
                link: itemUrl,
                guid: itemUrl,
                pubDate: new Date($('.col_news_date').text()).toUTCString(),
            };

            const cached = await caches.tryGet(itemUrl, async () => await GetDesc(itemUrl));

            return Promise.resolve(Object.assign({}, fetched, cached));
        })
    );

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const readableType = type === 'zbxx' ? '招标信息' : '通知公告';
    const response = await got({
        method: 'get',
        url: `${host}/${type}/list.htm`,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('a.col_news_item').slice(0, 10).get();

    const result = await ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `上海海洋大学 ${readableType}`,
        link: `${host}/${type}/list.htm`,
        description: '上海海洋大学 官网信息',
        item: result,
    };
};
