import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import utils from './utils';

export const route: Route = {
    path: '/index/:media?',
    categories: ['multimedia'],
    example: '/pianyuan/index',
    parameters: { media: '类别，见下表，默认为首页' },
    features: {
        requireConfig: [
            {
                name: 'PIANYUAN_COOKIE',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['pianyuan.org/'],
            target: '/index',
        },
    ],
    name: '最新资源',
    maintainers: ['greatcodeeer', 'jerry1119'],
    handler,
    url: 'pianyuan.org/',
    description: `| 电影 | 剧集 |
| ---- | ---- |
| mv   | tv   |`,
};

async function handler(ctx) {
    const media = ctx.req.param('media') ?? -1;
    const link_base = 'https://pianyuan.org/';
    let description = '电影和剧集';
    let link = link_base;
    if (media !== -1) {
        link = link_base + `?cat=${media}`;
        if (media === 'mv') {
            description = '电影';
        } else if (media === 'tv') {
            description = '剧集';
        } else {
            link = link_base;
        }
    }

    const response = await utils.request(link, cache);
    const $ = load(response.data);
    const detailLinks = $('#main-container > div > div.col-md-10 > table > tbody > tr')
        .get()
        .map((tr) => $(tr).find('td.dt.prel.nobr > a').attr('href'));
    detailLinks.shift();
    const items = await utils.ProcessFeed(detailLinks, cache);

    return {
        title: '片源网',
        description,
        link: link_base,
        item: items,
    };
}
