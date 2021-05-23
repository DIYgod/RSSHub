const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

const categoryCodes = new Map([
    ['society', { name: '日本社会', types: {} }],
    ['politics_economy', { name: '政治・经济', types: {} }],
    [
        'cool_japan',
        {
            name: '文娱・生活',
            types: {
                entertainment: '艺能',
                anime: '动漫',
                life: '生活・美食',
                style_culture: '时尚・文化',
            },
        },
    ],
    [
        'travel',
        {
            name: '旅游・活动',
            types: {
                news: '资讯',
                scenery: '风景',
                topic: '体验',
                move: '交通',
            },
        },
    ],
    ['sports', { name: '体育・奥运', types: {} }],
    ['business', { name: '商务・商品', types: {} }],
    ['technology', { name: 'IT・科技', types: {} }],
    ['world', { name: '国际・东亚', types: {} }],
    ['opinion', { name: '观点・专栏', types: {} }],
    ['whatsnew', { name: '最新', types: {} }],
]);

const host = 'https://asahichinese-j.com';

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const type = ctx.params.subCate;
    let iTitle = categoryCodes.get(category).name;

    let link = `https://asahichinese-j.com/${category}/`;
    if (type !== undefined) {
        link = link + `${type}/`;
        iTitle = iTitle + '-' + categoryCodes.get(category).types[type];
    }

    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const list = $('ul.List li')
        .slice(1, 11)
        .map(function () {
            const info = {
                title: $(this).find('a').text(),
                link: $(this).find('a').attr('href'),
                date: $(this).find('span.Date').text(),
            };
            logger.info(info.date);
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = host + info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);

            const $ = cheerio.load(response.data);
            const description = $('div.ArticleText').html().trim();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${iTitle}-朝日新聞中文网`,
        link: link,
        item: out,
    };
};
