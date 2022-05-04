const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.cqwu.net';
const map = {
    notify: '/channel_7721.html',
    academiceve: '/channel_7722.html',
};
const titleMap = {
    notify: '通知',
    academiceve: '学术活动',
};

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'academiceve';
    const link = host + map[type];
    const title = '重文理' + titleMap[type] + '公告';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('ul[class="list-unstyled news-uls"]').find('li');

    const items = await Promise.all(
        list.map(async (_, item) => {
            const pageUrl = host + $(item).find('a').attr('href');
            const desc = await ctx.cache.tryGet(pageUrl, async () => {
                const page = await got.get(pageUrl);
                const $ = cheerio.load(page.data);
                return $('.news-info').html();
            });

            return {
                title: $(item).find('a').text(),
                link: pageUrl,
                description: desc,
                pubDate: parseDate($(item).find('span').text()),
            };
        })
    );

    ctx.state.data = {
        title,
        link,
        item: items,
    };
};
