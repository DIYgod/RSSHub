import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://shopify.engineering';

export const route: Route = {
    path: '/engineering/:topic?',
    categories: ['programming'],
    example: '/shopify/engineering',
    parameters: {
        topic: 'Topic slug from `/topics/:topic`, e.g. `mobile`, `ai-machine-learning`. Defaults to the latest listing.',
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
            source: ['shopify.engineering/', 'shopify.engineering/latest'],
            target: '/engineering',
        },
        {
            source: ['shopify.engineering/topics/:topic'],
            target: '/engineering/:topic',
        },
    ],
    name: 'Engineering',
    maintainers: ['zhsama'],
    handler,
    url: 'shopify.engineering/latest',
};

async function handler(ctx): Promise<Data> {
    const topic = ctx.req.param('topic');
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;
    const link = topic ? `${baseUrl}/topics/${topic}` : `${baseUrl}/latest`;

    const response = await ofetch(link);
    const $ = load(response);

    const list: DataItem[] = $('article.article--index')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const $title = $item.find('a.font-aktivgroteskextended');
            const href = $title.attr('href') ?? $item.find('a[href^="/"]').not('[href^="/topics/"]').attr('href');
            const dateText = $item.find('.blogPost .richtext').text();
            const category = $item.find('a[href^="/topics/"]').text();

            return {
                title: $title.text(),
                link: href ? new URL(href, baseUrl).href : undefined,
                pubDate: dateText ? parseDate(dateText, ['MMM D, YYYY', 'YYYY-MM-DD']) : undefined,
                category: category ? [category] : undefined,
            };
        })
        .filter((item) => item.title && item.link)
        .slice(0, limit);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detail = await ofetch(item.link!);
                const $detail = load(detail);

                const published = $detail('meta[itemprop="datePublished"]').attr('content');
                const authors = [
                    ...new Set(
                        $detail('[itemprop="author"] [itemprop="name"]')
                            .toArray()
                            .map((el) => $detail(el).text())
                            .filter(Boolean)
                    ),
                ];

                const content = $detail('[itemprop="articleBody"]');
                content.find('.hidden, .leadpage-container').remove();

                return {
                    ...item,
                    title: $detail('h1[itemprop="headline"]').text() || item.title,
                    description: content.html() ?? $detail('meta[property="og:description"]').attr('content'),
                    pubDate: published ? parseDate(published) : item.pubDate,
                    author: authors.join(', ') || undefined,
                    image: $detail('meta[property="og:image"]').attr('content') || undefined,
                };
            })
        )
    );

    return {
        title: topic ? $('title').text() : 'Shopify Engineering',
        link,
        description: $('meta[name="description"]').attr('content'),
        image: 'https://cdn.shopify.com/b/shopify-brochure2-assets/c97c60ca19c64a8b5378d9f9e971f7bd.png',
        language: 'en-us',
        item: items,
    };
}
