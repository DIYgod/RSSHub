import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { getSearchParams, rootUrl } from './utils';

const currentUrl = `${rootUrl}/telegraph`;

export const route: Route = {
    path: '/telegraph',
    categories: ['finance'],
    example: '/chinastarmarket/telegraph',
    parameters: {},
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
            source: ['chinastarmarket.cn/telegraph'],
            target: '/chinastarmarket/telegraph',
        },
    ],
    name: 'K电报',
    maintainers: ['maxlixiang'],
    handler,
    url: 'chinastarmarket.cn/telegraph',
    description: '科创板日报 K电报，7x24 小时科创板头条快讯。',
};

async function handler(ctx) {
    const limit = getLimit(ctx);

    const { data: response } = await got(`${rootUrl}/v1/roll/get_roll_list`, {
        searchParams: getSearchParams({
            app: 'stib',
            category: 'stib',
            channel: '100',
            last_time: '0',
            refresh_type: '1',
            rn: limit.toString(),
        }),
        headers: {
            referer: currentUrl,
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
        },
    });

    const items = (response.data?.roll_data ?? []).slice(0, limit).map((item) => ({
        title: item.title || item.content,
        link: item.shareurl || `${rootUrl}/detail/${item.id}`,
        description: renderDescription(item),
        pubDate: parseDate(item.ctime * 1000),
        category: item.subjects?.map((subject) => subject.subject_name) ?? [],
        author: '科创板日报',
    }));

    return {
        title: '科创板日报 - K电报',
        link: currentUrl,
        description: '科创板日报 K电报，7x24 小时科创板头条快讯。',
        item: items,
    };
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 50;

    return Number.isFinite(limit) && limit > 0 ? limit : 50;
}

function renderDescription(item) {
    const content = item.content || item.brief || '';
    const images = [...new Set([...(item.images ?? []), ...(item.imgs ?? [])].filter(Boolean))];
    const related = item.sub_titles ?? [];

    return [
        content ? `<p>${content}</p>` : '',
        ...images.map((image) => `<p><img src="${image}" referrerpolicy="no-referrer"></p>`),
        related.length
            ? `<p><strong>相关阅读</strong></p><ul>${related
                  .map((article) => `<li><a href="${article.shareurl || `${rootUrl}/detail/${article.article_id || article.id}`}">${article.title}</a></li>`)
                  .join('')}</ul>`
            : '',
    ].join('');
}

