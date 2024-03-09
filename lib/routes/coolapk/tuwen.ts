import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: ['/tuwen/:type?', '/tuwen-xinxian'],
    categories: ['social-media'],
    example: '/coolapk/tuwen',
    parameters: { type: '默认为hot' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '图文',
    maintainers: ['xizeyoupan'],
    handler,
    description: `| 参数名称 | 编辑精选 | 最新   |
  | -------- | -------- | ------ |
  | type     | hot      | latest |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'hot';
    const requestPath = ctx.req.path;
    let feedTitle;
    const fullUrl = new URL('/v6/page/dataList', utils.base_url);
    if (requestPath.startsWith('/coolapk/tuwen-xinxian') || type === 'latest') {
        // 实时
        fullUrl.searchParams.append('url', `/feed/digestList?${new URLSearchParams('cacheExpires=300&type=12&message_status=all&is_html_article=1&filterEmptyPicture=1&filterTag=二手交易,酷安自贸区,薅羊毛小分队').toString()}`);
        fullUrl.searchParams.append('title', '新鲜图文');
        fullUrl.searchParams.append('subTitle', '');
        feedTitle = '酷安 - 新鲜图文';
    } else if (requestPath.startsWith('/coolapk/tuwen')) {
        // 精选
        fullUrl.searchParams.append('url', `#/feed/digestList?${new URLSearchParams('type=12&is_html_article=1&recommend=3,4').toString()}`);
        fullUrl.searchParams.append('title', '图文');

        feedTitle = '酷安图文 - 编辑精选';
    }
    fullUrl.searchParams.append('page', '1');

    const response = await got(fullUrl, {
        headers: utils.getHeaders(),
    });
    const data = response.data.data;

    const out = await Promise.all(data.map((item) => utils.parseDynamic(item)));

    return {
        title: feedTitle,
        link: 'https://www.coolapk.com/',
        description: feedTitle,
        item: out,
    };
}
