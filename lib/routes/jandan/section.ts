import type { DataItem, Route } from '@/types';

import { handleCommentSection, handleForumSection, handleTopSection } from './utils';

export const route: Route = {
    path: '/:category/:type?',
    example: '/jandan/top',
    name: 'Section',
    maintainers: ['nczitzk', 'pseudoyu'],
    parameters: {
        category: {
            description: '板块',
            options: [
                {
                    label: '热榜',
                    value: 'top',
                },
                {
                    label: '问答',
                    value: 'qa',
                },
                {
                    label: '树洞',
                    value: 'treehole',
                },
                {
                    label: '随手拍',
                    value: 'ooxx',
                },
                {
                    label: '无聊图',
                    value: 'pic',
                },
                {
                    label: '鱼塘',
                    value: 'bbs',
                },
            ],
        },
        type: {
            description: '热榜类型，仅当 category 选择 `top` 时有效',
            default: '4hr',
            options: [
                {
                    label: '4小时热门',
                    value: '4hr',
                },
                {
                    label: '3天内无聊图',
                    value: 'pic3days',
                },
                {
                    label: '7天内无聊图',
                    value: 'pic7days',
                },
            ],
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
    radar: [
        {
            source: ['i.jandan.net/:category'],
            target: '/jandan/:category?',
        },
    ],
    handler,
};

async function handler(ctx): Promise<{
    title: string;
    link: string;
    item: DataItem[];
}> {
    let category = ctx.req.param('category') ?? 'top';
    category = category.replace(/#.*$/, '');

    const type = ctx.req.param('type') ?? '4hr';
    const rootUrl = 'http://i.jandan.net';
    const currentUrl = `${rootUrl}/${category}`;

    let result: { title: string; items: DataItem[] };

    try {
        if (category === 'top') {
            result = await handleTopSection(rootUrl, type);
        } else if (category === 'bbs') {
            result = await handleForumSection(rootUrl);
        } else {
            result = await handleCommentSection(rootUrl, category);
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result = {
            title: `煎蛋 - ${category}`,
            items: [
                {
                    title: `抓取出错: ${category}`,
                    description: `抓取 ${category} 分区时出现错误: ${errorMessage}`,
                    link: currentUrl,
                    pubDate: new Date(),
                },
            ],
        };
    }

    return {
        title: result.title,
        link: currentUrl,
        item: result.items,
    };
}
