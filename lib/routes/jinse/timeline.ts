import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/timeline/:category?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/jinse/timeline',
    parameters: {
        category: {
            description: '分类',
            options: [
                { value: '头条', label: '头条' },
                { value: '独家', label: '独家' },
                { value: '铭文', label: '铭文' },
                { value: '产业', label: '产业' },
                { value: '项目', label: '项目' },
                { value: '政策', label: '政策' },
                { value: 'AI', label: 'AI' },
                { value: 'Web 3.0', label: 'Web 3.0' },
                { value: '以太坊 2.0', label: '以太坊 2.0' },
                { value: 'DeFi', label: 'DeFi' },
                { value: 'Layer2', label: 'Layer2' },
                { value: 'NFT', label: 'NFT' },
                { value: 'DAO', label: 'DAO' },
                { value: '百科', label: '百科' },
            ],
            default: '头条',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    description: `| 头条   | 独家 | 铭文    | 产业       | 项目 |
| ------ | ---- | ------- | ---------- | ---- |
| 政策   | AI   | Web 3.0 | 以太坊 2.0 | DeFi |
| Layer2 | NFT  | DAO     | 百科       |      |`,
};

async function handler(ctx) {
    const { category = '头条' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.jinse.cn';
    const rootApiUrl = 'https://api.jinse.cn';
    const apiUrl = new URL('noah/v3/timelines', rootApiUrl).href;
    const currentUrl = rootUrl;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            catelogue_key: category === '头条' ? 'www' : category,
            limit,
            information_id: 0,
            flag: 'up',
        },
    });

    let items = response.data.list.slice(0, limit).map((item) => {
        item = item.object_1 ?? item.object_2;

        return {
            title: item.title,
            link: item.jump_url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                images: item.cover
                    ? [
                          {
                              src: item.cover.replace(/_[^\W_]+(\.\w+)$/, '_true$1'),
                              alt: item.title,
                          },
                      ]
                    : undefined,
                intro: item.summary,
                description: item.content,
            }),
            author: item.author.nickname,
            guid: `jinse${/\/lives\//.test(item.jump_url) ? '-lives' : ''}-${item.id}`,
            pubDate: parseDate(item.published_at, 'X'),
            upvotes: item.up_counts ?? 0,
            downvotes: item.down_counts ?? 0,
            comments: item.comment_count ?? 0,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/\/lives\//.test(item.link)) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('section.js-article-content').html() || content('div.js-article').html(),
                });
                item.category = content('section.js-article-tag_state_1 a span')
                    .toArray()
                    .map((c) => content(c).text());

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const author = $('meta[name="author"]').prop('content');
    const image = $('a.js-logoBox img').prop('src');
    const icon = new URL($('link[rel="favicon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${author} - ${category}`,
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
