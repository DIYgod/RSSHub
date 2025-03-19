import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/:region?',
    categories: ['new-media', 'popular'],
    example: '/liveuamap',
    parameters: { region: 'region 热点地区，默认为`ukraine`，其他选项见liveuamap.com的三级域名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['liveuamap.com/:region*'],
            target: '/:region',
        },
    ],
    name: '实时消息',
    maintainers: ['CoderSherlock'],
    handler,
};

async function handler(ctx) {
    const region = ctx.req.param('region') ?? 'ukraine';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;
    if (!isValidHost(region)) {
        throw new InvalidParameterError('Invalid region');
    }

    const url = `https://${region}.liveuamap.com/`;

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const items = $('div#feedler > div')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('div.title').text(),
                description: item.find('div.title').text(),
                link: item.attr('data-link'),
            };
        });

    return {
        title: `Liveuamap - ${region}`,
        link: url,
        item: items,
    };
}
