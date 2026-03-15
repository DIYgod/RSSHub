import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['game'],
    example: '/chuapp/daily',
    parameters: {
        category: '栏目分类，见下表',
    },
    description: `
  | \`category\` | 栏目分类 |
  | ------------ | ------- |
  | \`daily\`    | 每日聚焦 |
  | \`pcz\`      | 最好玩   |
  | \`night\`    | 触乐夜话 |
  | \`news\`     | 动态资讯 |
    `,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['dousha'],
    radar: [
        {
            source: ['chuapp.com/category/:category'],
            target: '/:category',
        },
        {
            source: ['chuapp.com/tag/index/id/20369.html'],
            target: '/night',
        },
    ],
    handler,
};

const baseUrl = 'https://www.chuapp.com';
const pathLut: Record<string, { title: string; suffix: string }> = {
    daily: {
        title: '每日聚焦',
        suffix: '/category/daily',
    },
    pcz: {
        title: '最好玩',
        suffix: '/category/pcz',
    },
    night: {
        title: '触乐夜话',
        suffix: '/tag/index/id/20369.html',
    },
    news: {
        // route from the old implementation
        title: '动态资讯',
        suffix: '/category/zsyx',
    },
    zsyx: {
        // route for radar
        title: '动态资讯',
        suffix: '/category/zsyx',
    },
};

type InvalidArticle = {
    title?: string;
    link?: string;
};

type ValidArticle = {
    title: string;
    link: string;
};

type RawArticle = InvalidArticle | ValidArticle;

function isValidArticle(article: RawArticle): article is ValidArticle {
    return 'title' in article && 'link' in article && article.title !== null && article.link !== null;
}

function toJavaScriptTimestamp(x: string | number | null | undefined): number {
    return x ? Number(x) * 1000 : 0;
}

async function handler(ctx: Context): Promise<Data | null> {
    const { category = 'night' } = ctx.req.param();
    const subpath = pathLut[category];
    if (!subpath) {
        return null;
    }

    const targetUrl = `${baseUrl}${subpath.suffix}`;
    const response = await ofetch(targetUrl);
    const $ = load(response);

    const articles: RawArticle[] = $('a.fn-clear')
        .toArray()
        .map((element) => ({
            title: $(element).attr('title'),
            link: $(element).attr('href'),
        }));

    const processedItems: Array<Promise<DataItem>> = articles
        .filter((article: RawArticle): article is ValidArticle => isValidArticle(article))
        .map((article: ValidArticle) => {
            if (article.link.startsWith('/')) {
                return article;
            }

            return {
                title: article.title,
                link: `/${article.link}`,
            };
        })
        .map((article: ValidArticle) => {
            const fullArticleUrl = `${baseUrl}${article.link}`;
            return cache.tryGet(fullArticleUrl, async () => {
                const res = await ofetch(fullArticleUrl);
                const s = load(res);

                const item: DataItem = {
                    title: article.title,
                    link: article.link,
                    description: s('.content .the-content').html() || '',
                    pubDate: parseDate(toJavaScriptTimestamp(s('.friendly_time').attr('data-time'))),
                    author: s('.author-time .fn-left').text() || '',
                };

                return item;
            }) as Promise<DataItem>;
        });

    const items = await Promise.all(processedItems);

    return {
        title: `触乐 - ${subpath.title}`,
        link: targetUrl,
        item: items,
    };
}
