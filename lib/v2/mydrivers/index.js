const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const titles = {
    '': { '': '最新' },
    new: { '': '最新' },
    hot: { '': '最热' },
    ac: {
        new: '最新',
        hot: '最热',
    },
    bcid: {
        801: '电脑',
        802: '手机',
        803: '业界',
        806: '游戏',
        807: '汽车',
        809: '影视',
    },
    tid: {
        1000: '科学',
        1001: '排行',
        1002: '评测',
        1003: '一图',
    },
    icid: {
        67: '百度',
        90: '微软',
        121: '安卓',
        136: '华为',
        140: '魅族',
        148: 'OPPO',
        154: '三星',
        194: 'Xbox',
        270: '阿里',
        288: 'VIVO',
        385: '一加',
        429: '奔驰',
        461: '宝马',
        481: '大众',
        770: '比亚迪',
        1193: '特斯拉',
        6950: 'PS5',
        7259: '小鹏',
        7318: '蔚来',
        9355: '小米',
        12947: '理想',
    },
    cid: {
        12: '显卡',
        13: 'CPU',
        38: '路由器',
        201: '苹果',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type ?? '';
    const id = ctx.params.id ?? '';

    const rootUrl = 'https://m.mydrivers.com';
    const currentUrl = `${rootUrl}/${type === '' || type === 'ac' ? 'm/newslist.ashx' : 'newsclass.aspx'}${type ? (id ? `?${type}=${id}` : `?ac=${type}`) : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.newst a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('.ab, .bb').remove();

                item.author = content('.writer').text();
                item.description = content('#content').html();
                item.pubDate = timezone(parseDate(content('.news_t1 ul li').eq(1).text().trim(), 'YYYY年MM月DD日 mm:ss'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${titles[type][id]} - 快科技`,
        link: currentUrl,
        item: items,
    };
};
