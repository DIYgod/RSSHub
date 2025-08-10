import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/topics/:type',
    categories: ['bbs'],
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
    description: `支持通过 \`filter_node\` 查询参数过滤特定节点的主题。

查询参数：
- \`filter_node\`: 过滤掉指定的节点，多个节点名用逗号分隔。例如：\`?filter_node=solana,movie\` 将过滤掉 solana 和 movie 节点的主题

示例：
- \`/v2ex/topics/hot?filter_node=solana\` - 过滤掉 solana 节点的最热主题
- \`/v2ex/topics/latest?filter_node=solana,movie\` - 过滤掉 solana 和 movie 节点的最新主题`,
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const filterNode = ctx.req.query('filter_node');

    const cacheKey = `v2ex:topics:${type}:filter:${filterNode || 'none'}`;

    return await cache.tryGet(cacheKey, async () => {
        const { data } = await got(`https://www.v2ex.com/api/topics/${type}.json`);

        let title;
        if (type === 'hot') {
            title = '最热主题';
        } else if (type === 'latest') {
            title = '最新主题';
        }

        let list = data;
        if (filterNode) {
            const filterNodes = new Set(filterNode.split(',').map((n) => n.trim()));
            list = list.filter((item) => !filterNodes.has(item.node.name));
        }

        return {
            title: `V2EX-${title}`,
            link: 'https://www.v2ex.com/',
            description: `V2EX-${title}`,
            item: list.map((item) => ({
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
    });
}
