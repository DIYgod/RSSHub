import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const categories = {
    aaaaa: '全部',
    aphen: '时文',
    brfpia: '生活',
    qvyrg: '商业',
    exicx: '科技',
    phena: '科普',
    iycfg: '趣闻',
    ytmwg: '成长',
    kdpkg: '科学',
    zisju: '心理',
    hooui: '经济',
    ucbyq: '美文',
    bvfjmu: '自然',
    wnzun: '人文',
};

export const route: Route = {
    path: '/news/:category?',
    categories: ['study'],
    example: '/shanbay/news',
    parameters: {
        category: {
            description: '分类 id',
            options: Object.entries(categories).map(([value, label]) => ({ value, label })),
            default: 'aaaaa',
        },
    },
    radar: [
        {
            source: ['web.shanbay.com/reading/web-news'],
            target: '/news',
        },
    ],
    name: '今日短文',
    maintainers: ['qiwihui'],
    handler,
    url: 'web.shanbay.com/reading/web-news',
};

async function handler(ctx: Context) {
    const { category = 'aaaaa' } = ctx.req.param();
    const apiUrl = 'https://apiv3.shanbay.com';
    const baseUrl = 'https://web.shanbay.com/reading/web-news';
    const headers = {
        Origin: 'https://web.shanbay.com',
        Referer: 'https://web.shanbay.com/',
    };

    const categoryMap = await cache.tryGet<Record<string, string>>('shanbay:news:categories', async () => {
        const { objects } = await ofetch<{ objects: Array<{ id: string; name: string }> }>(`${apiUrl}/news/categories`);
        return Object.fromEntries(objects.map((item) => [item.id, item.name]));
    });

    const response = await ofetch(`${apiUrl}/news/retrieve/articles`, {
        headers,
        query: {
            sbay_level_id: 'aaaaa',
            category_id: category,
            page: 1,
            ipp: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 15,
        },
    });

    const items = await Promise.all(
        response.objects.map((article) =>
            cache.tryGet(`${baseUrl}/articles/${article.id}`, async () => {
                const detail = await ofetch(`${apiUrl}/news/articles/${article.id}`);
                const $ = load(detail.content, { xmlMode: true });

                const description = $('para')
                    .toArray()
                    .map((para) => {
                        const $para = $(para);
                        const img = $para.find('img url').text();
                        return img
                            ? `<img src="${img.split('?', 1)[0]}" alt="${$para.find('img desc').text()}" />`
                            : `<p>${$para
                                  .find('sent')
                                  .toArray()
                                  .map((sent) => $(sent).text())
                                  .join(' ')}</p>`;
                    })
                    .join('');

                return {
                    title: `${article.title_en} | ${article.title_cn}`,
                    description,
                    link: `${baseUrl}/articles/${article.id}`,
                    pubDate: timezone(parseDate(article.published_at), 8),
                    category: [article.category.name, article.exam_level.name, article.sbay_level.name],
                    author: `${article.source.name_en} (${article.source.name_cn})`,
                };
            })
        )
    );

    return {
        title: `扇贝阅读 - ${categoryMap[category] ?? '全部'}`,
        link: baseUrl,
        item: items,
    };
}
