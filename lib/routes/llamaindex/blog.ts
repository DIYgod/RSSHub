import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '15', 10);

    const baseUrl = 'https://www.llamaindex.ai';
    const targetUrl = `${baseUrl}/blog`;

    const response = await ofetch(targetUrl);
    const $ = load(response);
    const language = $('html').attr('lang') ?? 'en';

    const links = new Set<string>();
    $('a[href^="/blog/"].PostThumbnail').each((_, element) => {
        const href = $(element).attr('href');
        if (href && !href.includes('?tag=')) {
            links.add(href);
        }
    });

    // Fetch full content for each post
    const items: DataItem[] = await Promise.all(
        [...links].slice(0, limit).map((link) => {
            const fullUrl = `${baseUrl}${link}`;
            return cache.tryGet(fullUrl, async (): Promise<DataItem> => {
                try {
                    const detailResponse = await ofetch(fullUrl);
                    const $detail = load(detailResponse);
                    let title = $detail('meta[property="og:title"]').attr('content') || $detail('title').text();
                    title = title.replace(' — LlamaIndex - Build Knowledge Assistants over your Enterprise Data', '').trim();
                    const description = $detail('meta[name="description"]').attr('content') || $detail('meta[property="og:description"]').attr('content') || '';
                    const publishedTime = $detail('meta[property="article:published_time"]').attr('content');
                    const image = $detail('meta[property="og:image"]').attr('content');

                    return {
                        title,
                        description,
                        link: fullUrl,
                        pubDate: publishedTime ? parseDate(publishedTime) : undefined,
                        image,
                        language,
                    };
                } catch {
                    return {
                        title: 'Error loading post',
                        description: '',
                        link: fullUrl,
                        language,
                    };
                }
            });
        })
    );

    return {
        title: 'LlamaIndex Blog',
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        language,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'llamaindex.ai',
    maintainers: ['sakamossan'],
    handler,
    example: '/llamaindex/blog',
    parameters: undefined,
    description: undefined,
    categories: ['programming'],
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
            source: ['llamaindex.ai/blog', 'www.llamaindex.ai/blog'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
};
