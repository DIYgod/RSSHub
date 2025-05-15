import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/topics/:type',
    categories: ['bbs', 'popular'],
    view: ViewType.Articles,
    example: '/v2ex/topics/latest',
    parameters: {
        type: {
            description: '主题类型',
            options: [
                {
                    value: 'hot',
                    label: '最热主题',
                },
                {
                    value: 'latest',
                    label: '最新主题',
                },
            ],
            default: 'hot',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最热 / 最新主题',
    maintainers: ['WhiteWorld'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    const { data } = await got(`https://www.v2ex.com/api/topics/${type}.json`);

    let title;
    if (type === 'hot') {
        title = '最热主题';
    } else if (type === 'latest') {
        title = '最新主题';
    }

    return {
        title: `V2EX-${title}`,
        link: 'https://www.v2ex.com/',
        description: `V2EX-${title}`,
        item: data.map((item) => ({
            title: item.title,
            description: `${item.member.username}: ${item.content_rendered}`,
            content: { text: item.content, html: item.content_rendered },
            pubDate: parseDate(item.created, 'X'),
            link: item.url,
            author: item.member.username,
            comments: item.replies,
            category: [item.node.title],
        })),
    };
}
