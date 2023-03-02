const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    精选: '',
    链游: 'aipysd',
    元宇宙: 'arxgdo',
    NFT: 'dwhfpp',
    DeFi: 'gsqjtg',
    监管: 'kohnph',
    央行数字货币: 'loskks',
    波卡: 'sxrabd',
    'Layer 2': 'tdkreq',
    DAO: 'yyufxg',
    融资: 'zahilv',
    活动: 'zqives',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '精选';

    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/webapi/depth/list?LId=1&Rn=${ctx.query.limit ?? 25}&TagId=${categories[category]}&tw=0`;
    const currentUrl = `${rootUrl}/zh/profundity/index.html`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.map((item) => ({
        title: item.title,
        author: item.author.name,
        pubDate: parseDate(item.publishTime * 1000),
        link: `${rootUrl}/zh/articledetails/${item.id}.html`,
        description: `<blockquote>${item.desc}</blockquote>`,
        category: item.tags,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description += content('#txtinfo').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `PANews - ${category}`,
        link: currentUrl,
        item: items,
    };
};
