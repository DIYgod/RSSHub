import path from 'node:path';

import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import { getSearchParams, rootUrl } from './utils';

const categories = {
    1000: '头条',
    1003: '股市',
    1135: '港股',
    1007: '环球',
    1005: '公司',
    1118: '券商',
    1110: '基金',
    1006: '地产',
    1032: '金融',
    1119: '汽车',
    1111: '科创',
    1127: '创业版',
    1160: '品见',
    1124: '期货',
    1176: '投教',
};

export const route: Route = {
    path: '/depth/:category?',
    categories: ['finance'],
    example: '/cls/depth/1000',
    parameters: { category: '分类代码，可在首页导航栏的目标网址 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '深度',
    maintainers: ['nczitzk'],
    handler,
    description: `| 头条 | 股市 | 港股 | 环球 | 公司 | 券商 | 基金 | 地产 | 金融 | 汽车 | 科创 | 创业版 | 品见 | 期货 | 投教 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- |
| 1000 | 1003 | 1135 | 1007 | 1005 | 1118 | 1110 | 1006 | 1032 | 1119 | 1111 | 1127   | 1160 | 1124 | 1176 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '1000';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const title = categories[category];

    if (!title) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/finance#cai-lian-she-shen-du">docs</a>');
    }

    const apiUrl = `${rootUrl}/v3/depth/home/assembled/${category}`;
    const currentUrl = `${rootUrl}/depth?id=${category}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: getSearchParams(),
    });

    let items = [...response.data.data.top_article, ...response.data.data.depth_list].slice(0, limit).map((item) => ({
        title: item.title || item.brief,
        link: `${rootUrl}/detail/${item.id}`,
        pubDate: parseDate(item.ctime * 1000),
        author: item.source,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const nextData = JSON.parse(content('script#__NEXT_DATA__').text());
                const articleDetail = nextData.props.initialState.detail.articleDetail;

                item.author = articleDetail.author?.name ?? item.author ?? '';
                item.description = art(path.join(__dirname, 'templates/depth.art'), {
                    articleDetail,
                });

                return item;
            })
        )
    );

    return {
        title: `财联社 - ${title}`,
        link: currentUrl,
        item: items,
    };
}
