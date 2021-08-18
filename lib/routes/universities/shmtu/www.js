const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://www.shmtu.edu.cn';

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const description = $('meta[name="description"]').attr('content');

    return { description };
}

const ProcessFeed = (list, caches) =>
    Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const itemUrl = url.resolve(host, $('.title', item).find('a').attr('href'));
            const category = $('.department', item).text().trim();

            const single = {
                title: $('.title', item).text().trim(),
                link: itemUrl,
                guid: itemUrl,
                pubDate: new Date($('.date', item).find('span').find('span').attr('content')).toUTCString(),
                category,
                author: category,
            };

            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const info = type === 'notes' ? '通知公告' : '学术讲座';

    const response = await got({
        method: 'get',
        url: host + `/${type}`,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('tr', 'tbody').slice(0, 10).get();

    const result = await ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `上海海事大学 ${info}`,
        link: host + `/${type}`,
        description: '上海海事大学 官网信息',
        item: result,
    };
};
