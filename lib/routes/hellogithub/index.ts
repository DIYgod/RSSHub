import { Route } from '@/types';
import got from '@/utils/got';

import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const sorts = {
    featured: '精选',
    all: '全部',
};

export const route: Route = {
    path: '/home/:sort?/:id?',
    categories: ['programming'],
    example: '/hellogithub/home',
    parameters: { sort: '排序方式，见下表，默认为 `featured`，即精选', id: '标签 id，可在对应标签页 URL 中找到，默认为全部标签' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '开源项目',
    maintainers: ['moke8', 'nczitzk', 'CaoMeiYouRen'],
    handler,
    description: `| 精选 | 全部 |
  | ---- | ---- |
  | featured  | all |`,
};

async function handler(ctx) {
    const sort = ctx.req.param('sort') ?? 'featured';
    const id = ctx.req.param('id') ?? '';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://hellogithub.com';
    const apiRootUrl = 'https://api.hellogithub.com';
    const currentUrl = `${rootUrl}/?sort_by=${sort}${id ? `&tid=${id}` : ''}`;
    const apiUrl = `${apiRootUrl}/v1/?sort_by=${sort}${id ? `&tid=${id}` : ''}&page=1`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let tag;
    if (id) {
        const tagUrl = `${rootUrl}/tags/${id}`;

        const tagResponse = await got({
            method: 'get',
            url: tagUrl,
        });

        const $ = load(tagResponse.data);

        tag = $('meta[property="og:title"]')?.attr('content')?.split(' ').pop();
    }

    const items = response.data.data.slice(0, limit).map((item) => ({
        guid: item.item_id,
        title: `${item.name}: ${item.title}`,
        author: item.author,
        link: `${rootUrl}/repository/${item.item_id}`,
        pubDate: parseDate(item.updated_at),
        name: `${item.author}/${item.name}`,
        summary: item.summary,
        language: item.primary_lang,
    }));

    return {
        title: `HelloGithub - ${sorts[sort]}${tag || ''}开源项目`,
        link: currentUrl,
        item: items,
    };
}
