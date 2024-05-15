import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import utils from './utils';

const typeMap = {
    351: {
        name: '名师风采',
    },
    353: {
        name: '热点新闻',
    },
    354: {
        name: '教务公告',
    },
    355: {
        name: '教学新闻',
    },
};

export const route: Route = {
    path: '/jwzx/:type?/:page?',
    categories: ['university'],
    example: '/hrbust/jwzx',
    parameters: { type: '分类名，默认为教务公告', page: '文章数，默认为12' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['LenaNouzen'],
    handler,
    description: `| 名师风采 | 热点新闻 | 教务公告 | 教学新闻 |
  | -------- | -------- | -------- | -------- |
  | 351      | 353      | 354      | 355      |`,
};

async function handler(ctx) {
    const page = ctx.req.param('page') || '12';
    const base = utils.columnIdBase(ctx.req.param('type')) + '&pagingNumberPer=' + page;
    const res = await got(base);
    const info = utils.fetchAllArticle(res.data, utils.JWZXBASE);

    const details = await Promise.all(info.map((e) => utils.detailPage(e, cache)));

    // ctx.set('json', {
    //     info,
    // };

    return {
        title: '哈理工教务处' + typeMap[ctx.req.param('type') || 354].name,
        link: base,
        item: details,
    };
}
