import { load } from 'cheerio';
import { decodeHTML } from 'entities';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

interface Post {
    link: string;
    title: { rendered: string };
    content: { rendered: string };
    date_gmt: string;
    modified_gmt: string;
    jetpack_featured_media_url: string;
    _embedded?: {
        author?: Array<{ name: string }>;
        'wp:term'?: Array<Array<{ name: string }>>;
    };
}

export const route: Route = {
    path: '/developer/:language?',
    name: 'Technical Blog',
    url: 'developer.nvidia.com/blog',
    example: '/nvidia/developer',
    categories: ['programming'],
    maintainers: ['ljh12138164'],
    parameters: {
        language: {
            description: 'Blog language',
            default: 'en',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh-CN', label: 'Simplified Chinese' },
            ],
        },
    },
    description: 'Full technical articles from the official WordPress API, including images, code blocks, and tables. The official feeds only contain excerpts.',
    zh: {
        name: '技术博客',
        parameters: {
            language: {
                description: '文章语言。中英文站分别维护，文章列表和发布时间可能不同',
                default: 'en',
                options: [
                    { value: 'en', label: '英语' },
                    { value: 'zh-CN', label: '简体中文' },
                ],
            },
        },
        description: '官方 Feed 只提供摘要。本路由通过官方 WordPress API 获取全文，保留图片、代码块和表格。使用 `/nvidia/developer/zh-CN` 订阅简体中文，或使用 `/nvidia/developer/en` 订阅英文。',
    },
    radar: [
        { source: ['developer.nvidia.com/blog', 'developer.nvidia.com/blog/:slug'], target: '/developer/en' },
        { source: ['developer.nvidia.cn/blog', 'developer.nvidia.cn/blog/:slug'], target: '/developer/zh-CN' },
        { source: ['developer.nvidia.com/zh-cn/blog', 'developer.nvidia.com/zh-cn/blog/:slug'], target: '/developer/zh-CN' },
    ],
    features: { requirePuppeteer: false, supportRadar: true },
    handler: async (ctx) => {
        const language = ctx.req.param('language') ?? 'en';
        if (language !== 'en' && language !== 'zh-CN') {
            throw new NotFoundError('Unsupported language. Use en or zh-CN.');
        }
        const link = language === 'zh-CN' ? 'https://developer.nvidia.cn/blog/' : 'https://developer.nvidia.com/blog/';

        const posts = await ofetch<Post[]>(`${link}wp-json/wp/v2/posts`, { query: { per_page: Math.min(getRouteLimit(ctx, 20), 100), _embed: 'author,wp:term' } });

        return {
            title: language === 'zh-CN' ? 'NVIDIA 技术博客' : 'NVIDIA Technical Blog',
            link,
            language,
            item: posts.map((post) => {
                const $ = load(post.content.rendered, null, false);
                $('script, style, button, .heading-anchor-link').remove();
                return {
                    title: decodeHTML(post.title.rendered),
                    link: post.link,
                    description: $.html(),
                    pubDate: parseDate(`${post.date_gmt}Z`),
                    updated: parseDate(`${post.modified_gmt}Z`),
                    author:
                        post._embedded?.author
                            ?.filter((author) => author.name)
                            .map((author) => decodeHTML(author.name))
                            .join(', ') || undefined,
                    category: post._embedded?.['wp:term']
                        ?.flat()
                        .filter((term) => term.name)
                        .map((term) => decodeHTML(term.name)),
                    image: post.jetpack_featured_media_url || undefined,
                };
            }),
        };
    },
};
