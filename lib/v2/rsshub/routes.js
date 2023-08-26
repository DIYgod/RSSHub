const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const lang = ctx.params.lang === 'en' ? 'en/' : '';
    const types = [
        'social-media',
        'new-media',
        'traditional-media',
        'bbs',
        'blog',
        'programming',
        'design',
        'live',
        'multimedia',
        'picture',
        'anime',
        'program-update',
        'university',
        'forecast',
        'travel',
        'shopping',
        'game',
        'reading',
        'government',
        'study',
        'journal',
        'finance',
        'other',
    ];
    const all = await Promise.all(
        types.map(async (type) => {
            const response = await got(`https://docs.rsshub.app/${lang}routes/${type}`);

            const data = response.data;

            const $ = cheerio.load(data);
            const page = $('.page').toArray();
            const item = $('.routeBlock').toArray();
            return { page, item, type };
        })
    );
    const list = all.flatMap(({ page, item, type }) => item.map((item) => ({ page, item, type })));

    ctx.state.data = {
        title: lang === 'en/' ? 'RSSHub has new routes' : 'RSSHub 有新路由啦',
        link: 'https://docs.rsshub.app',
        description: lang === 'en/' ? 'Everything is RSSible' : '万物皆可 RSS',
        language: lang === 'en/' ? 'en-us' : 'zh-cn',
        item: list.map(({ page, item, type }) => {
            const $ = cheerio.load(page);
            item = $(item);
            const h2Title = item.prevAll('h2').eq(0);
            const h3Title = item.prevAll('h3').eq(0);
            return {
                title: `${h2Title.text().trim()} - ${h3Title.text().trim()}`,
                description: item.html(),
                link: `https://docs.rsshub.app/${lang}routes/${type}#${encodeURIComponent(h2Title.find('.hash-link').attr('href') && h3Title.find('.hash-link').attr('href')?.substring(1))}`,
                guid: item.attr('id'),
            };
        }),
    };
};
