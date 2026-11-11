import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://nvidianews.nvidia.com';

export const route: Route = {
    path: '/newsroom',
    name: 'Newsroom',
    url: 'nvidianews.nvidia.com',
    example: '/nvidia/newsroom',
    categories: ['new-media'],
    maintainers: ['ljh12138164'],
    description: 'Full articles from the English newsroom feed, covering press releases and selected NVIDIA Blog posts. Expands blog excerpts into complete articles.',
    zh: {
        name: '新闻中心',
        description: '订阅英文新闻中心的新闻稿和部分企业博客文章，并补全其中只有摘要的正文。',
    },
    radar: [{ source: ['nvidianews.nvidia.com', 'nvidianews.nvidia.com/news/:slug'], target: '/newsroom' }],
    features: { requirePuppeteer: false, supportRadar: true },
    handler: async (ctx) => {
        const response = await ofetch(`${rootUrl}/rss.xml`, { responseType: 'text' });
        const feed = await parser.parseString(response);

        return {
            title: 'NVIDIA Newsroom',
            link: rootUrl,
            description: feed.description,
            language: 'en',
            item: await pMap(
                feed.items.slice(0, getRouteLimit(ctx)),
                async (item) => {
                    const article = await cache.tryGet(item.link!, () => fetchArticle(item.link!));
                    return {
                        title: item.title!,
                        link: item.link,
                        description: article.description,
                        image: article.image,
                        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                        author: item.creator ?? item.author,
                        category: [...new Set([...article.category, ...(item.categories ?? [])])],
                    };
                },
                { concurrency: 3 }
            ),
        };
    },
};

async function fetchArticle(link: string) {
    const response = await ofetch(link, { responseType: 'text' });
    const $ = load(response);
    const article = $('.article-body, .entry-content, .full-width-layout__sections').first();
    if (!article.length) {
        throw new Error(`NVIDIA article content not found: ${link}`);
    }
    article.find('script, style, button, .heading-anchor-link').remove();

    return {
        description: article.html()!,
        image: $('meta[property="og:image"]').attr('content'),
        category: $('.nvidia-category-item a, .nvidia-tag-item a, .full-width-layout__terms a')
            .toArray()
            .map((element) => $(element).text()),
    };
}
