import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const categories = {
    0: '全部',
    1: '精选',
    2: '政策',
    3: '数据',
    4: 'NFT',
    5: '项目',
};

export const route: Route = {
    path: '/lives/:category?',
    categories: ['finance'],
    example: '/jinse/lives',
    parameters: { category: '分类，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '快讯',
    maintainers: ['nczitzk'],
    handler,
    description: `| 全部 | 精选 | 政策 | 数据 | NFT | 项目 |
  | ---- | ---- | ---- | ---- | --- | ---- |
  | 0    | 1    | 2    | 3    | 4   | 5    |`,
};

async function handler(ctx) {
    const { category = '0' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://jinse.cn';
    const rootApiUrl = 'https://api.jinse.cn';
    const apiUrl = new URL('noah/v2/lives', rootApiUrl).href;
    const currentUrl = new URL('lives', rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            limit,
            reading: false,
            source: 'web',
            flag: 'up',
            id: 0,
            category,
        },
    });

    const items =
        response.list
            .flatMap((l) => l.lives)
            .slice(0, limit)
            .map((item) => ({
                title: item.content_prefix,
                link: new URL(`lives/${item.id}.html`, rootUrl).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    images:
                        item.images?.map((i) => ({
                            src: i.url.replace(/_[^\W_]+(\.\w+)$/, '_true$1'),
                            width: i.width,
                            height: i.height,
                        })) ?? [],
                    description: item.content,
                    original: item.link
                        ? {
                              link: item.link,
                              name: item.link_name,
                          }
                        : undefined,
                }),
                author: item.show_source_name,
                guid: `jinse-lives-${item.id}`,
                pubDate: parseDate(item.created_at, 'X'),
                upvotes: item.up_counts ?? 0,
                downvotes: item.down_counts ?? 0,
                comments: item.comment_count ?? 0,
            })) ?? [];

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const author = $('meta[name="author"]').prop('content');
    const image = $('a.js-logoBox img').prop('src');
    const icon = new URL($('link[rel="favicon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${author} - ${Object.hasOwn(categories, category) ? categories[category] : category}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        allowEmpty: true,
    };
}
