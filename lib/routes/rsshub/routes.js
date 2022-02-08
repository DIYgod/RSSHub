const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
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
            const response = await got({
                method: 'get',
                url: `https://docs.rsshub.app/${type}.html`,
            });

            const data = response.data;

            const $ = cheerio.load(data);
            const page = $('.page').get();
            const item = $('.routeBlock').get();
            return { page, item, type };
        })
    );
    const list = [];
    all.forEach(({ page, item, type }) => {
        item.forEach((item) => {
            list.push({ page, item, type });
        });
    });

    ctx.state.data = {
        title: 'RSSHub 有新路由啦',
        link: 'https://docs.rsshub.app',
        description: '万物皆可 RSS',
        item: list.map(({ page, item, type }) => {
            const $ = cheerio.load(page);
            item = $(item);
            const titleEle = item.prevAll('h2').eq(0);
            return {
                title: `${titleEle.text().slice(2)} - ${item.prevAll('h3').eq(0).text().slice(2)}`,
                description: item.html(),
                link: `https://docs.rsshub.app/${type}.html#${encodeURIComponent(titleEle.find('.header-anchor').attr('href') && titleEle.find('.header-anchor').attr('href').slice(1))}`,
                guid: item.attr('id'),
            };
        }),
    };
};
