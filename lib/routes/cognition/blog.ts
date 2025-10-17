import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { type Context } from 'hono';

const baseUrl = 'https://cognition.ai';

export const route: Route = {
    path: '/blog/:page?',
    name: 'Blog',
    url: 'cognition.ai/blog',
    maintainers: ['Loongphy'],
    example: '/cognition/blog',
    categories: ['programming'],
    parameters: {
        page: 'Page number, defaults to 1',
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
            source: [String.raw`cognition.ai/blog/:page(\d+)`],
            target: '/blog/:page',
        },
    ],
    view: ViewType.Articles,
    handler,
};

const splitAuthors = (text: string | undefined): DataItem['author'] => {
    if (!text) {
        return undefined;
    }

    const names = text
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);

    if (names.length === 0) {
        return undefined;
    }

    return names.map((name) => ({
        name,
    }));
};

export async function handler(ctx: Context): Promise<Data> {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);
    const pageParam = ctx.req.param('page');
    const pageNumber = Number.parseInt(pageParam ?? '1', 10);
    const currentPage = Number.isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

    const listPath = `/blog/${currentPage}`;
    const targetUrl = new URL(listPath, baseUrl).href;
    const html = await ofetch(targetUrl);
    const $ = load(html);

    const items: DataItem[] = [];

    for (const el of $('#blog-post-list__list li.blog-post-list__list-item').slice(0, limit).toArray()) {
        const element = $(el);
        const linkElement = element.find('a.o-blog-preview').first();

        const href = linkElement.attr('href');
        const link = href ? new URL(href, baseUrl).href : undefined;

        if (!link) {
            continue;
        }

        const title = linkElement.find('h3.o-blog-preview__title').text().trim();
        if (!title) {
            continue;
        }

        const summary = linkElement.find('p.o-blog-preview__intro').text().trim();

        const dateNode = linkElement.find('.o-blog-preview__meta-date').clone();
        dateNode.find('.o-blog-preview__meta').remove();
        const dateText = dateNode.text().trim();
        const authorText = linkElement.find('.o-blog-preview__meta-author').text().trim();

        const dataItem: DataItem = {
            title,
            link,
            pubDate: parseDate(dateText),
        };

        if (summary) {
            dataItem.description = summary;
        }

        const authors = splitAuthors(authorText);
        if (authors) {
            dataItem.author = authors;
        }

        items.push(dataItem);
    }

    const detailedItems = await Promise.all(
        items.map((item) => {
            const link = item.link;

            if (!link) {
                return item;
            }

            return cache.tryGet(link, async () => {
                const detailHtml = await ofetch(link);
                const $$ = load(detailHtml);

                const article = $$('#blog-post__body').first();
                const image = $$('meta[property="og:image"]').attr('content');

                const processedItem: DataItem = {
                    ...item,
                };

                if (image) {
                    processedItem.banner = image;
                    processedItem.image = image;
                }

                const articleHtml = article.html();
                if (articleHtml) {
                    processedItem.content = {
                        html: articleHtml,
                        text: article.text().trim(),
                    };
                }

                return processedItem;
            });
        })
    );

    const imageAttr = $('meta[property="og:image"]').attr('content');
    const image = imageAttr ? new URL(imageAttr, baseUrl).href : undefined;

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        allowEmpty: true,
        item: detailedItems,
        image,
    };
}
