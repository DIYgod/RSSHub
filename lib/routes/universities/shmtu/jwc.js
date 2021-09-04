const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://jwc.shmtu.edu.cn';

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    $('.field-item img').each((index, elem) => {
        const $elem = $(elem);
        const src = $elem.attr('src');
        if (src) {
            $elem.attr('src', url.resolve(host, src));
        }
        $elem.removeAttr('style');
        $elem.removeAttr('alt');
    });

    const description = $('.field-item').html();

    return { description };
}

const ProcessFeed = async (list, caches) =>
    await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const itemUrl = url.resolve(host, $('.views-field-nothing', item).find('a').slice(1).attr('href'));
            const category = $('.views-field-field-xxlb', item).text().trim();
            const author = $('.views-field-field-xxly', item).text().trim();

            const single = {
                title: $('.views-field-nothing', item).text().trim(),
                link: itemUrl,
                guid: itemUrl,
                pubDate: new Date($('.views-field-created', item).text()).toUTCString(),
                category: category,
                author: author === '' ? category : author,
            };

            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const info = type === 'jiaowugonggao' ? '教务公告' : '教务新闻';

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
        description: '上海海事大学 教务信息',
        item: result,
    };
};
