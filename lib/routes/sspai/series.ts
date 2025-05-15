import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/series',
    categories: ['new-media', 'popular'],
    example: '/sspai/series',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['sspai.com/series'],
        },
    ],
    name: '最新上架付费专栏',
    maintainers: ['HenryQW'],
    handler,
    url: 'sspai.com/series',
    description: `> 少数派专栏需要付费订阅，RSS 仅做更新提醒，不含付费内容.`,
};

async function handler() {
    const response = await ofetch('https://sspai.com/api/v1/series/tag/all/get', {
        parseResponse: JSON.parse,
    });

    const products = response.data.flatMap((category) =>
        category.children
            .filter((item) => item.sell_status)
            .map((item) => {
                const price = item.price / 100;
                return {
                    id: item.id,
                    title: `￥${price} - ${item.title}`,
                    link: `https://sspai.com/series/${item.id}`,
                    author: item.author.nickname,
                };
            })
    );

    const item = await Promise.all(
        products.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await ofetch(`https://sspai.com/api/v1/series/info/get?id=${item.id}&view=second`);
                const data = res.data;
                const banner = `<img src="https://cdn.sspai.com/${data.banner_web}" />`;
                const description = banner + data.intro;
                const $ = load(description);
                $('img').css('max-width', '100%');
                item.description = $.html();
                return item;
            })
        )
    );

    return {
        title: '少数派 -- 最新上架付费专栏',
        link: 'https://sspai.com/series',
        description: '少数派 -- 最新上架付费专栏',
        item,
    };
}
