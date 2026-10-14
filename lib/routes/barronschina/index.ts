import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?',
    categories: ['finance'],
    example: '/barronschina',
    parameters: { id: '栏目 id，默认为快讯' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.barrons.com.cn/', 'www.barrons.com.cn/news'],
            target: '/',
        },
        {
            source: ['www.barrons.com.cn/column/:id'],
            target: '/:id',
        },
    ],
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.barrons.com.cn',
    description: '栏目 id 留空则返回快报，可在新站栏目地址 `https://www.barrons.com.cn/column/121` 中找到栏目 id，例如 `121` 为选股、`4891` 为财富。付费文章只返回源站公开提供的预览内容。',
};

type ApiResponse<T> = {
    result: string;
    data: T;
};

type Article = {
    guid: number;
    title: string;
    content?: string;
    summary?: string;
    published_at?: number;
    item_type: 'article' | 'news';
    barron_author?: string;
    authors?: Array<{ nickname: string }>;
    column_list?: Array<{ title: string }>;
    cover_image?: { original?: { url?: string } };
};

const rootUrl = 'https://www.barrons.com.cn';
const apiUrl = 'https://api.barrons.com.cn';
// Public client identifiers used by the website's anonymous API requests.
const apiHeaders = {
    client: 'pc',
    'app-version': '1.0.0',
    'app-key': '81fRY2dR7JShBOQUEqCn',
};

const toItem = (article: Article): DataItem => ({
    title: article.title,
    description: article.content || article.summary,
    link: `${rootUrl}/${article.item_type === 'news' ? 'news' : 'articles'}/${article.guid}`,
    pubDate: article.published_at ? parseDate(article.published_at, 'X') : undefined,
    author: article.barron_author || article.authors?.map((author) => author.nickname).join(', '),
    category: article.column_list?.map((column) => column.title),
    image: article.cover_image?.original?.url,
});

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = 20;
    const currentUrl = `${rootUrl}/${id ? `column/${id}` : 'news'}`;
    let title = '快报';
    if (id) {
        const column = await ofetch<ApiResponse<{ title?: string }>>(`${apiUrl}/column/${id}`, { headers: apiHeaders });
        if (column.result !== 'ok' || !column.data.title) {
            throw new InvalidParameterError(`Unknown column: ${id}. Find a current column ID at ${rootUrl}.`);
        }
        title = column.data.title;
    }
    const response = await ofetch<ApiResponse<Article[]>>(`${apiUrl}/${id ? `list/column/${id}` : 'news/list'}`, {
        headers: apiHeaders,
        query: { limit },
    });
    const items = await Promise.all(
        response.data.map((article) =>
            id
                ? cache.tryGet(`${apiUrl}/${article.item_type === 'news' ? 'news' : 'article'}/${article.guid}`, async () => {
                      const detail = await ofetch<ApiResponse<Article>>(`${apiUrl}/${article.item_type === 'news' ? 'news' : 'article'}/${article.guid}`, {
                          headers: apiHeaders,
                          query: { fields: 'content;authors;column_list;has_access;' },
                      });
                      return toItem(detail.data);
                  })
                : toItem(article)
        )
    );

    return {
        title: `巴伦中文网 - ${title}`,
        link: currentUrl,
        item: items,
    };
}
