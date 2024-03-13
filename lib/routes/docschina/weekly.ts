import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

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
    return {
        title,
        link: baseURL + path,
        item: data?.props?.pageProps?.data?.map((item) => ({
            title: item.title,
            description: item.description,
            link: `${baseURL}${path}/${item.issue}`,
            author: item.editors?.join(','),
            itunes_item_image: item.imageUrl,
        })),
    };
}
