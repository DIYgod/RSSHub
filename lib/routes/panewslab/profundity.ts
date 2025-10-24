import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

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

export const route: Route = {
    path: '/profundity/:category?',
    categories: ['new-media'],
    example: '/panewslab/profundity',
    parameters: { category: '分类，见下表，默认为精选' },
    radar: [
        {
            source: ['panewslab.com/', 'www.panewslab.com/zh/profundity/index.html'],
        },
    ],
    name: '深度',
    maintainers: ['nczitzk'],
    handler,
    url: 'panewslab.com/',
    description: `| 精选 | 链游 | 元宇宙 | NFT | DeFi | 监管 | 央行数字货币 | 波卡 | Layer 2 | DAO | 融资 | 活动 |
| ---- | ---- | ------ | --- | ---- | ---- | ------------ | ---- | ------- | --- | ---- | ---- |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '精选';

    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/webapi/depth/list?LId=1&Rn=${ctx.req.query('limit') ?? 25}&TagId=${categories[category]}&tw=0`;
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
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description += content('#txtinfo').html();

                return item;
            })
        )
    );

    return {
        title: `PANews - ${category}`,
        link: currentUrl,
        item: items,
    };
}
