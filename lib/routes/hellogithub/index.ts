import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const sorts = {
    hot: '热门',
    last: '最近',
};

export const route: Route = {
    path: ['/article/:sort?/:id?'],
    categories: ['programming'],
    example: '/hellogithub/article',
    parameters: { sort: '排序方式，见下表，默认为 `hot`，即热门', id: '标签 id，可在对应标签页 URL 中找到，默认为全部标签' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    maintainers: ['moke8', 'nczitzk'],
    handler,
    description: `| 热门 | 最近 |
  | ---- | ---- |
  | hot  | last |`,
};

async function handler(ctx) {
    const sort = ctx.req.param('sort') ?? 'hot';
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

    let buildId, tag;
    if (id) {
        const tagUrl = `${rootUrl}/tags/${id}`;

        const tagResponse = await got({
            method: 'get',
            url: tagUrl,
        });

        const $ = load(tagResponse.data);

        tag = $('meta[property="og:title"]')?.attr('content')?.split(' ').pop();
        buildId = tagResponse.data.match(/"buildId":"(.*?)",/)[1];
    }

    if (!buildId) {
        const buildResponse = await got({
            method: 'get',
            url: rootUrl,
        });

        buildId = buildResponse.data.match(/"buildId":"(.*?)",/)[1];
    }

    let items = response.data.data.slice(0, limit).map((item) => ({
        guid: item.item_id,
        title: item.title,
        author: item.author,
        link: `${rootUrl}/repository/${item.item_id}`,
        description: item.description,
        pubDate: parseDate(item.updated_at),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailUrl = `${rootUrl}/_next/data/${buildId}/repository/${item.guid}.json`;

                const detailResponse = await got({
                    method: 'get',
                    url: detailUrl,
                });

                const data = detailResponse.data.pageProps.repo;

                item.title = `${data.name}: ${data.title}`;
                item.category = [`No.${data.volume_name}`, ...data.tags.map((t) => t.name)];
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    name: data.full_name,
                    description: data.description,
                    summary: data.summary,
                    image: data.image_url,
                    stars: data.stars ?? data.stars_str,
                    isChinese: data.has_chinese,
                    language: data.primary_lang,
                    isActive: data.is_active,
                    license: data.license,
                    isOrganization: data.is_org,
                    forks: data.forks,
                    openIssues: data.open_issues,
                    subscribers: data.subscribers,
                    homepage: data.homepage,
                    url: data.url,
                });

                return item;
            })
        )
    );

    return {
        title: `HelloGithub - ${sorts[sort]}${tag || ''}项目`,
        link: currentUrl,
        item: items,
    };
}
