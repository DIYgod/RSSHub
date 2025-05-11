import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';

const titles = {
    total: '全站',
    focus: '国际',
    science: '科学',
    car: '汽车',
    zvideo: '视频',
    fashion: '时尚',
    depth: '时事',
    digital: '数码',
    sport: '体育',
    school: '校园',
    film: '影视',
};

export const route: Route = {
    path: '/hot/:category?',
    categories: ['social-media', 'popular'],
    example: '/zhihu/hot',
    view: ViewType.Articles,
    parameters: {
        category: {
            description: '分类',
            default: 'total',
            options: [
                {
                    value: 'total',
                    label: '全站',
                },
                {
                    value: 'focus',
                    label: '国际',
                },
                {
                    value: 'science',
                    label: '科学',
                },
                {
                    value: 'car',
                    label: '汽车',
                },
                {
                    value: 'zvideo',
                    label: '视频',
                },
                {
                    value: 'fashion',
                    label: '时尚',
                },
                {
                    value: 'depth',
                    label: '时事',
                },
                {
                    value: 'digital',
                    label: '数码',
                },
                {
                    value: 'sport',
                    label: '体育',
                },
                {
                    value: 'school',
                    label: '校园',
                },
                {
                    value: 'film',
                    label: '影视',
                },
            ],
        },
    },
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '知乎热榜',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    description: `::: warning
  需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'total';
    const cookie = config.zhihu.cookies;
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少知乎用户登录后的 Cookie 值');
    }

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v3/feed/topstory/hot-lists/${category}?limit=50`,
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
        title: `知乎热榜 - ${titles[category]}`,
        link: `https://www.zhihu.com/hot?list=${category}`,
        item: items,
    };
}
