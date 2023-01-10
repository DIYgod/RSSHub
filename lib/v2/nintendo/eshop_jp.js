const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const response = await got('https://search.nintendo.jp/nintendo_soft/search.json', {
        searchParams: {
            opt_sshow: 1,
            fq: 'ssitu_s:onsale OR ssitu_s:preorder OR memo_bg:forced',
            limit: ctx.query.limit ? Number(ctx.query.limit) : 24,
            page: 1,
            c: '50310840317994813',
            opt_osale: 1,
            opt_hard: '1_HAC',
            sort: 'sodate desc,score',
        },
    });
    const data = response.data.result.items;

    ctx.state.data = {
        title: 'Nintendo eShop（日服）新游戏',
        link: 'https://www.nintendo.co.jp/software/switch/index.html',
        description: 'Nintendo eShop（日服）新上架的游戏',
        item: data.map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, 'templates/eshop_jp.art'), {
                item,
            }),
            link: `https://ec.nintendo.com/JP/ja/titles/${item.id}`,
            pubDate: parseDate(item.pdate),
        })),
    };
};
