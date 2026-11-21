import { load } from 'cheerio';
import { decodeHTML } from 'entities';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

interface Post {
    link: string;
    title: { rendered: string };
    content: { rendered: string; protected: boolean };
    date_gmt: string;
    modified_gmt: string;
    yoast_head_json?: {
        author?: string;
        og_image?: Array<{ url: string }>;
        schema?: {
            '@graph'?: Array<{
                '@type': string;
                articleSection?: string[];
                keywords?: string[];
            }>;
        };
    };
}

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/the-decoder/news',
    name: 'News',
    maintainers: ['ljh12138164'],
    description:
        'Free-to-read English news and analysis in full from the official WordPress API, including images and videos. Skips subscriber-only posts and posts without a body. Returns up to 30 articles by default; use the common `limit` parameter to request up to 100 articles.',
    zh: {
        name: '新闻',
        description: '通过官方 WordPress API 获取可免费阅读的英文新闻与分析全文，保留正文中的图片和视频，跳过订阅专享和无正文的文章。默认最多返回 30 篇，可通过通用参数 `limit` 请求最多 100 篇。',
    },
    radar: [{ source: ['the-decoder.com/', 'the-decoder.com/artificial-intelligence-news/'] }],
    handler,
};

const baseUrl = 'https://the-decoder.com';
const maxPageSize = 100;

function hasPublicBody({ content }: Post) {
    if (content.protected || !content.rendered) {
        return false;
    }

    const $ = load(content.rendered, undefined, false);
    $('script, style, template, noscript').remove();
    return /\S/.test($.root().text()) || $(':is(img, iframe, audio, video, audio source, video source)[src]:not([src=""]), img[srcset]:not([srcset=""]), img[data-src]:not([data-src=""])').length > 0;
}

async function fetchPublicPosts(perPage: number) {
    const posts = await ofetch<Post[]>(`${baseUrl}/wp-json/wp/v2/posts`, {
        query: {
            per_page: perPage,
            _fields: 'link,title,content,date_gmt,modified_gmt,yoast_head_json',
        },
    });
    return { publicPosts: posts.filter((post) => hasPublicBody(post)), fullPage: posts.length === perPage };
}

async function handler(ctx: Context): Promise<Data> {
    const limit = Math.min(getRouteLimit(ctx, 30), maxPageSize);
    const perPage = Math.min(limit * 2, maxPageSize);
    const firstPage = await fetchPublicPosts(perPage);
    const { publicPosts } = firstPage.fullPage && firstPage.publicPosts.length < limit && perPage < maxPageSize ? await fetchPublicPosts(maxPageSize) : firstPage;
    const items = publicPosts.slice(0, limit).map((post) => {
        const metadata = post.yoast_head_json;
        const article = metadata?.schema?.['@graph']?.find((node) => node['@type'] === 'NewsArticle' || node['@type'] === 'Article');
        return {
            title: decodeHTML(post.title.rendered),
            description: post.content.rendered,
            link: post.link,
            pubDate: post.date_gmt ? parseDate(`${post.date_gmt}Z`) : undefined,
            updated: post.modified_gmt ? parseDate(`${post.modified_gmt}Z`) : undefined,
            author: metadata?.author,
            image: metadata?.og_image?.[0]?.url,
            category: [...new Set([...(article?.articleSection ?? []), ...(article?.keywords ?? [])])].map((category) => decodeHTML(category)),
        };
    });

    return {
        title: 'The Decoder',
        link: baseUrl,
        description: 'Artificial intelligence news, business, and research from The Decoder.',
        language: 'en',
        item: items,
    };
}
