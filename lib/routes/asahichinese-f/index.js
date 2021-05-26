const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

const categoryCodes = new Map([
    ['society', { name: '國內綜合', types: {} }],
    ['politics_economy', { name: '政治・經濟', types: {} }],
    [
        'cool_japan',
        {
            name: '文化・生活',
            types: {
                entertainment: '藝能',
                anime: '動漫',
                life: '生活・美食',
                style_culture: '時尚・藝文',
            },
        },
    ],
    [
        'travel',
        {
            name: '旅遊・活動',
            types: {
                news: '資訊',
                scenery: '風景',
                topic: '體驗',
                move: '交通',
            },
        },
    ],
    ['sports', { name: '體育・奧運', types: {} }],
    ['business', { name: '商業・商品', types: {} }],
    ['technology', { name: 'IT・科技', types: {} }],
    ['world', { name: '國際・東亞', types: {} }],
    ['opinion', { name: '評論・專欄', types: {} }],
    ['whatsnew', { name: '最新消息', types: {} }],
]);

const host = 'https://asahichinese-f.com';

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const type = ctx.params.subCate;
    let iTitle = categoryCodes.get(category).name;

    let link = `https://asahichinese-f.com/${category}/`;
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
        title: `${iTitle}-朝日新聞中文網`,
        link: link,
        item: out,
    };
};
