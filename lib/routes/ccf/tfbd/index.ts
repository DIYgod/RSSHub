import { Route } from '@/types';
import cache from '@/utils/cache';
import utils from './utils';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/tfbd/:caty/:id',
    categories: ['study'],
    example: '/ccf/tfbd/xwdt/tzgg',
    parameters: { caty: '主分类，可在 URL 找到', id: '子分类，可在 URL 找到' },
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
            source: ['tfbd.ccf.org.cn/tfbd/:caty/:id', 'tfbd.ccf.org.cn/'],
        },
    ],
    name: '大数据专家委员会',
    maintainers: ['tudou027'],
    handler,
};

async function handler(ctx) {
    const base = utils.urlBase(ctx.req.param('caty'), ctx.req.param('id'));
    const res = await got(base);
    const info = utils.fetchAllArticles(res.data);
    const $ = load(res.data);

    const details = await Promise.all(info.map((e) => utils.detailPage(e, cache)));

    ctx.set('json', {
        info,
    });

    return {
        title: '大数据专家委员会 - ' + $('.position a:last-child').text(),
        link: base,
        item: details,
    };
}
