import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hot/:category?',
    categories: ['social-media'],
    example: '/zhihu/hot',
    view: ViewType.Articles,
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: '',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '知乎热榜',
    maintainers: ['nczitzk', 'pseudoyu', 'DIYgod'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    if (category) {
        ctx.set('redirect', `/zhihu/hot`);
        return null;
    }

    const cookie = config.zhihu.cookies;

    const response = await got({
        method: 'get',
        url: `https://api.zhihu.com/topstory/hot-lists/total?limit=10&reverse_order=0`,
        headers: {
            Cookie: cookie,
        },
    });

    const items = response.data.data.map((item) => {
        const questionId = item.target.url ? item.target.url.split('/').pop() : String(item.target.id);
        return {
            link: `https://www.zhihu.com/question/${questionId}`,
            title: item.target.title,
            pubDate: parseDate(item.target.created * 1000),
            description: item.target.excerpt ? `<p>${item.target.excerpt}</p>` : '',
        };
    });

    return {
        title: `知乎热榜`,
        link: `https://www.zhihu.com/hot`,
        item: items,
    };
}
