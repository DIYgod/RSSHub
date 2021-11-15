import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';
const host = 'https://jwc.shmtu.edu.cn';

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

const ProcessFeed = (list, caches) =>
    Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const itemUrl = url.resolve(host, $('.views-field-nothing', item).find('a').attr('href'));
            const category = $('.views-field-field-xxlb', item).text().trim();
            const author = $('.views-field-field-xxly', item).text().trim();

            const single = {
                title: $('.views-field-nothing', item).text().trim(),
                link: itemUrl,
                guid: itemUrl,
                pubDate: new Date($('.views-field-created', item).text()).toUTCString(),
                category,
                author: author === '' ? category : author,
            };

            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            return {
                ...single,
                ...other
            };
        })
    );

export default async (ctx) => {
    const {
        query,
        params
    } = ctx;

    const {
        type
    } = params;
    const {
        limit = 4
    } = query;
    const info = type === 'jwgg' ? '教务公告' : '教务新闻';

    const response = await got({
        method: 'get',
        url: host + `/${type}/list.htm`,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('tr', 'tbody')
        .slice(0, limit > 15 ? 15 : limit)
        .get();

    const result = await ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `上海海事大学 ${info}`,
        link: host + `/${type}`,
        description: '上海海事大学 教务信息',
        item: result,
    };
};
