import { escapeText } from 'entities';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/popular/:period?',
    example: '/zaobao/popular/daily',
    name: '热门新闻',
    categories: ['traditional-media'],
    maintainers: ['DIYgod'],
    parameters: { period: 'daily（单日，默认）或 weekly（一周）。' },
    description: 'Includes the source’s ranked headlines, summaries, and images. Complete articles may require a Zaobao subscription.',
    radar: [{ source: ['zaobao.com.sg/news'], target: '/popular/daily' }],
    handler,
};

async function handler(ctx) {
    const period = ctx.req.param('period') ?? 'daily';
    if (!['daily', 'weekly'].includes(period)) {
        throw new InvalidParameterError('period must be daily or weekly.');
    }
    const response = await ofetch('https://www.zaobao.com.sg/_plat/api/v2/client/cms/trending', { query: { region: 'sg' } });
    return {
        title: `联合早报 - 热门新闻 - ${period === 'daily' ? '单日' : '一周'}`,
        link: 'https://www.zaobao.com.sg/news',
        language: 'zh-CN' as const,
        item: response.response[`${period}TopArticles`].map((article) => ({
            title: article.title,
            link: article.href.split('?', 1)[0],
            pubDate: parseDate(article.timestamp, 'X'),
            category: [article.category_label],
            description: `${article.thumbnail ? `<img src="${article.thumbnail}">` : ''}<p>${escapeText(article.summary)}</p>`,
        })),
    };
}
