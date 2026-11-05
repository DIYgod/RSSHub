import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getArticleDescription, getPageData, type LuoguArticle } from './utils';

const md = MarkdownIt();

export const route: Route = {
    path: '/daily/:id?',
    categories: ['programming'],
    example: '/luogu/daily',
    parameters: { id: '年度日报所在帖子 id，可在 URL 中找到，不填默认为 `47327`' },
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
            source: ['luogu.com.cn/discuss/47327', 'luogu.com.cn/'],
            target: '/daily',
        },
    ],
    name: '日报',
    maintainers: ['LogicJake', 'prnake', 'nczitzk'],
    handler,
    url: 'luogu.com.cn/discuss/47327',
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 47327;
    const link = `https://www.luogu.com.cn/discuss/${id}`;
    const response = await ofetch(link, { responseType: 'text' });
    const { post } = getPageData<{ post: { content: string } }>(response);
    const dailyLink = post.content.match(/<(https?:[^>]+)>/)?.[1];
    if (!dailyLink) {
        throw new Error('The Luogu daily index does not contain an article or collection link. Check the discussion ID.');
    }
    const dailyResponse = await ofetch(dailyLink, { responseType: 'text' });
    const data = getPageData<{ articles?: { result: LuoguArticle[] }; article?: LuoguArticle }>(dailyResponse);
    const articles = data.articles?.result ?? (data.article ? [data.article] : undefined);
    if (!articles) {
        throw new Error('The Luogu daily index link is not an article or collection. Check the discussion ID.');
    }
    const item = await pMap(
        articles,
        async (article) => {
            const link = `https://www.luogu.com/article/${article.lid}`;
            return {
                title: article.title,
                link,
                author: article.author.name,
                pubDate: parseDate(article.time, 'X'),
                description: data.article ? md.render(article.content) : await getArticleDescription(link),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '洛谷日报',
        link,
        item,
    };
}
