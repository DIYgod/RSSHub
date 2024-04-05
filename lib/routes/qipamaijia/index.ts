import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const rootUrl = 'https://www.qipamaijia.com';

export const route: Route = {
    path: '/:cate?',
    categories: ['picture'],
    example: '/qipamaijia/fuli',
    parameters: { cate: '频道名，可在对应网址中找到，默认为最新' },
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
            source: ['qipamaijia.com/', 'qipamaijia.com/:cate'],
            target: '/:cate',
        },
    ],
    name: '频道',
    maintainers: ['Fatpandac', 'nczitzk'],
    handler,
    url: 'qipamaijia.com/',
};

async function handler(ctx) {
    const cate = ctx.req.param('cate') ?? '';
    const url = `${rootUrl}/${cate}`;

    const response = await got({
        method: 'get',
        url,
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(response.data);
    const title = $('#highlight').text();
    const items = $('div.col_l > div.block')
        .map((_index, item) => ({
            title: $(item).find('div.content').text(),
            link: $(item).find('a').attr('href'),
            description: $(item).find('div.content').html() + $(item).find('div.thumb').html(),
        }))
        .get();

    return {
        title: `奇葩买家秀 - ${title}`,
        link: url,
        item: items,
    };
}
