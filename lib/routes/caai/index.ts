import { Route } from '@/types';
import cache from '@/utils/cache';
import utils from './utils';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/:caty',
    categories: ['study'],
    example: '/caai/45',
    parameters: { caty: '分类 ID，可在 URL 找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '学会动态',
    maintainers: ['tudou027'],
    handler,
};

async function handler(ctx) {
    const base = utils.urlBase(ctx.req.param('caty'));
    const res = await got(base);
    const info = utils.fetchAllArticles(res.data);
    const $ = load(res.data);

    const details = await Promise.all(info.map((e) => utils.detailPage(e, cache)));

    ctx.set('json', {
        info,
    });

    return {
        title: '中国人工智能学会 - ' + $('.article-list h1').text(),
        link: base,
        item: details,
    };
}
