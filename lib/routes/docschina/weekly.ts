import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/weekly/:category?',
    categories: ['programming'],
    example: '/docschina/weekly',
    parameters: { category: '周刊分类，见下表，默认为js' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Unknown',
    maintainers: ['daijinru', 'hestudy'],
    handler,
};

async function handler(ctx) {
    const { category = 'js' } = ctx.req.param();

    const baseURL = 'https://docschina.org';
    const path = `/news/weekly/${category}`;
    const { data: res } = await got(`${baseURL}${path}`);
    // @ts-ignore
    const $ = load(res);

    const title = $('head title').text();
    const dataEl = $('#__NEXT_DATA__');
    const dataText = dataEl.text();
    const data = JSON.parse(dataText);
    const items = await Promise.all(
        data?.props?.pageProps?.data?.map((item) => {
            const link = `${baseURL}${path}/${item.issue}`;
            return cache.tryGet(link, async () => {
                const { data: response } = await got(link);
                // @ts-ignore
                const $ = load(response);
                return {
                    title: item.title,
                    description: $('#__next > main > div > div').first().html(),
                    link: `${baseURL}${path}/${item.issue}`,
                    author: item.editors?.join(','),
                    itunes_item_image: item.imageUrl,
                };
            });
        }) || {}
    );

    ctx.set('data', {
        title,
        link: baseURL + path,
        item: items,
    });
};
