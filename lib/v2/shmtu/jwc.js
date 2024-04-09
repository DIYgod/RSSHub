const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const host = 'https://jwc.shmtu.edu.cn';

async function load(link) {
    const response = await got(link, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);

    return $('.wp_articlecontent').html();
}

const ProcessFeed = (list, caches) =>
    Promise.all(
        list.map((item) =>
            caches.tryGet(item.link, async () => {
                item.description = await load(item.link);
                return item;
            })
        )
    );

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const info = type === 'jwgg' ? '教务公告' : '教务新闻';

    const response = await got(`${host}/${type}/list.htm`, {
        headers: {
            Referer: host,
        },
        https: { rejectUnauthorized: false },
    });

    const $ = cheerio.load(response.data);
    const list = $('tbody tr')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.views-field-nothing a').attr('title').trim(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: timezone(parseDate(item.find('.pubdate').text()), 8),
                category: item.find('.views-field-field-xxlb').text(),
                author: item.find('.views-field-field-xxly').text(),
            };
        });

    const result = await ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `上海海事大学 ${info}`,
        link: `${host}/${type}`,
        description: '上海海事大学 教务信息',
        item: result,
    };
};
