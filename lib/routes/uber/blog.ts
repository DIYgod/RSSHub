import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.uber.com';
const engineeringUrl = `${baseUrl}/us/en/blog/engineering`;
const categoryLabels = {
    'uber-ai': 'AI / ML',
    backend: 'Backend',
    culture: 'Culture',
    data: 'Data',
    mobile: 'Mobile',
    security: 'Security',
    web: 'Web',
} as const;
const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }));

type Category = keyof typeof categoryLabels;
type ArticleSummary = {
    title: string;
    link: string;
};

export const route: Route = {
    path: '/blog/:category?',
    categories: ['blog'],
    example: '/uber/blog',
    parameters: {
        category: {
            description: 'Category slug from `/blog/engineering/:category`. Defaults to all engineering articles.',
            options: categoryOptions,
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['eng.uber.com/', 'www.uber.com/:country/:language/blog/engineering'],
            target: '/blog',
        },
        {
            source: ['www.uber.com/:country/:language/blog/engineering/:category'],
            target: '/blog/:category',
        },
    ],
    name: 'Engineering',
    maintainers: ['hulb', 'zhsama'],
    handler,
    url: 'www.uber.com/us/en/blog/engineering',
    description: 'The optional category parameter uses the slug from an Uber Engineering category URL. Deprecated numeric `maxPage` values remain accepted and return the overview feed.',
    zh: {
        description: '可选的分类参数使用 Uber Engineering 分类 URL 中的 slug。已弃用的数字 `maxPage` 参数仍然兼容，并返回全部文章。',
    },
};

async function handler(ctx: Context): Promise<Data> {
    const category = resolveCategory(ctx.req.param('category'));
    const limit = Number(ctx.req.query('limit') || 20);
    const link = category ? `${engineeringUrl}/${category}/` : `${engineeringUrl}/`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('[data-testid="newsroom-article-feed-card"]')
        .toArray()
        .map((element) => {
            const $title = $(element)
                .find('a[href*="/blog/"]')
                .filter((_, link) => /\S/.test($(link).text()));
            const href = $title.attr('href');

            if (!href) {
                return;
            }

            return {
                title: $title.text(),
                link: new URL(href, baseUrl).href,
            } satisfies ArticleSummary;
        })
        .filter((item) => item !== undefined)
        .slice(0, limit);

    const items = await Promise.all(list.map((item) => getArticle(item)));

    return {
        title: category ? `Uber Engineering Blog - ${categoryLabels[category]}` : 'Uber Engineering Blog',
        link,
        description: $('meta[name="description"]').attr('content'),
        image: $('meta[property="og:image"]').attr('content'),
        language: 'en-us',
        item: items,
    };
}

function getArticle(item: ArticleSummary): Promise<DataItem> {
    return cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        const $header = $('[data-block-id="ArticleHeader"]');
        const $content = $('[data-block-id="LongFormContent"] [data-testid="content"]');
        // The header contains duplicate publication labels for responsive layouts.
        const published = $header.find('[data-baseweb="typo-labellarge"]').first().text();
        const authors = [
            ...new Set(
                $('[data-block-id="ArticleAuthor"] [data-testid="authors-grid"] [role="img"][aria-label]')
                    .toArray()
                    .map((author) => $(author).attr('aria-label'))
                    .filter((author): author is string => Boolean(author))
            ),
        ];
        const categories = $('[data-block-id="ArticleCategories"] [data-baseweb="tag"] [title]')
            .toArray()
            .map((tag) => $(tag).attr('title'))
            .filter((category): category is string => Boolean(category));

        return {
            ...item,
            title: $header.find('h1').text() || item.title,
            description: $content.html() ?? $('meta[name="description"]').attr('content'),
            pubDate: published ? parseDate(published) : undefined,
            author: authors.join(', ') || undefined,
            category: categories.length > 0 ? categories : undefined,
            image: $('meta[property="og:image"]').attr('content'),
        };
    });
}

function resolveCategory(category: string | undefined): Category | undefined {
    if (!category || /^\d+$/.test(category)) {
        return undefined;
    }

    if (!Object.hasOwn(categoryLabels, category)) {
        throw new InvalidParameterError(`Invalid category: ${category}. Valid categories are: ${Object.keys(categoryLabels).join(', ')}`);
    }

    return category as Category;
}
