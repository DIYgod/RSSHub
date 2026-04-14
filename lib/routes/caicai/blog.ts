import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog/:lang?',
    categories: ['blog'],
    example: '/caicai/blog',
    parameters: {
        lang: {
            description: 'Language',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh', label: '中文' },
            ],
            default: 'en',
        },
    },
    radar: [
        {
            source: ['www.caicai.me/blogs'],
        },
        {
            source: ['www.caicai.me/zh/blogs'],
            target: '/blog/zh',
        },
    ],
    name: 'Blog',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.caicai.me/blogs',
};

const baseUrl = 'https://www.caicai.me';

const renderAnnotation = (rich) =>
    rich
        .map((t) => {
            let s = t.content;
            const a = t.annotations;
            if (a.code) {
                s = `<code>${s}</code>`;
            }
            if (a.bold) {
                s = `<strong>${s}</strong>`;
            }
            if (a.italic) {
                s = `<em>${s}</em>`;
            }
            if (a.strikethrough) {
                s = `<s>${s}</s>`;
            }
            if (a.underline) {
                s = `<u>${s}</u>`;
            }
            if (t.href) {
                s = `<a href="${t.href}">${s}</a>`;
            }
            return s;
        })
        .join('');

const renderBlocks = (blocks) =>
    blocks
        .map((b, i) => {
            switch (b.type) {
                case 'paragraph':
                    return b.text.length ? `<p>${renderAnnotation(b.text)}</p>` : '';
                case 'heading_2':
                    return b.text.length ? `<h2>${renderAnnotation(b.text)}</h2>` : '';
                case 'heading_3':
                    return b.text.length ? `<h3>${renderAnnotation(b.text)}</h3>` : '';
                case 'bulleted_list_item': {
                    if (!b.text.length) {
                        return '';
                    }
                    const open = blocks[i - 1]?.type === 'bulleted_list_item' ? '' : '<ul>';
                    const close = blocks[i + 1]?.type === 'bulleted_list_item' ? '' : '</ul>';
                    return `${open}<li>${renderAnnotation(b.text)}</li>${close}`;
                }
                case 'image':
                    return `<img src="${new URL(b.url, baseUrl).href}">`;
                case 'divider':
                    return '<hr>';
                default:
                    return '';
            }
        })
        .join('');

async function handler(ctx: Context) {
    const { lang = 'en' } = ctx.req.param();
    const prefix = lang === 'en' ? '' : `/${lang}`;
    const link = `${baseUrl}${prefix}/blogs`;

    const response = await ofetch(link);
    const $ = load(response);

    const nextData = JSON.parse($('script#__NEXT_DATA__').text());

    const list = nextData.props.pageProps.posts.map((post) => ({
        title: post.frontMatter.title,
        link: `${baseUrl}${prefix}/blogs/${post.slug}`,
        description: post.frontMatter.excerpt,
        pubDate: parseDate(post.frontMatter.dateIso),
        category: [post.frontMatter.group],
        image: new URL(post.frontMatter.cover_image, baseUrl).href,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const { pageProps } = JSON.parse($('script#__NEXT_DATA__').text()).props;
                const blocks = lang === 'en' ? pageProps.blocks : pageProps.chineseBlocks;

                item.description = renderBlocks(blocks);

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        language: lang === 'en' ? ('en' as const) : ('zh-CN' as const),
        image: $('head meta[property="og:image"]').attr('content'),
        item: items,
    };
}
