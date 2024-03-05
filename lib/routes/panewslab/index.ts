// @ts-nocheck
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

export default async (ctx) => {
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

    ctx.set('data', {
        title: `PANews - ${category}`,
        link: currentUrl,
        item: items,
    });
};
