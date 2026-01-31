import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, blogBaseUrl, getBlog, getBlogListCategory, getNews } from './utils';

const configs = {
    0: {
        name: '全部',
    },
    9998: {
        name: '开源资讯',
    },
    9999: {
        name: '软件资讯',
    },
    4: {
        name: 'AI & 大模型',
    },
    3: {
        name: '云原生',
    },
    12: {
        name: '大前端',
    },
    10: {
        name: '软件架构',
    },
    11: {
        name: '开发技能',
    },
    6: {
        name: '硬件 & IoT',
    },
    9: {
        name: 'DevOps',
    },
    19: {
        name: '操作系统',
    },
    8: {
        name: '程序人生',
    },
    5: {
        name: '数据库',
    },
    2: {
        name: '区块链 & Web3 & 元宇宙',
    },
    14: {
        name: '软件测试 & 运维',
    },
    13: {
        name: '信息安全',
    },
    15: {
        name: '网络技术',
    },
    7: {
        name: '信息安全',
    },
    1: {
        name: '开源治理',
    },
    16: {
        name: '游戏开发',
    },
    17: {
        name: '多媒体处理',
    },
};

export const route: Route = {
    path: '/news/:category?',
    categories: ['programming'],
    example: '/oschina/news',
    parameters: {
        category: {
            description: '板块名',
            default: '0',
            options: Object.entries(configs).map(([key, value]) => ({ value: key, label: value.name })),
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
            source: ['oschina.net'],
            target: '/news',
        },
    ],
    name: '资讯',
    maintainers: ['tgly307', 'zengxs'],
    handler,
};

async function handler(ctx) {
    let { category = '0' } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit') ?? 30, 10);

    switch (category) {
        case 'all':
            category = '0';
            break;
        case 'industry':
        case 'industry-news':
        case 'programming':
            category = '9998';
            break;
        case 'project':
            category = '9999';
            break;
        default:
            break;
    }

    const blogListCategory = await getBlogListCategory();
    const config = blogListCategory.find((item) => item.id.toString() === category) ?? blogListCategory[0];

    const response = await ofetch(`${baseUrl}/ApiHomeNew${config.apiPath}`, {
        query: {
            page: 1,
            pageSize: limit,
            type: category,
        },
    });

    const list = response.result.map((item) => ({
        title: item.obj_title,
        description: item.detail,
        link: item.obj_type === 4 ? `${baseUrl}/news/${item.obj_id}${item.ident ? `/${item.ident}` : ''}` : `${blogBaseUrl}/u/${item.userVo.id}/blog/${item.obj_id}`,
        guid: `oschina:${item.obj_type === 4 ? 'news' : 'blog'}:${item.obj_id}`,
        objectType: item.obj_type,
        detailId: item.obj_id,
        pubDate: parseDate(item.create_time, 'x'),
        author: item.userVo.name,
        image: item.image,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.guid, async () => {
                if (item.objectType === 4) {
                    const response = await getNews(item.detailId);
                    item.description = response.code === 200 ? response.result.detail : item.description;
                } else if (item.objectType === 3) {
                    const response = await getBlog(item.detailId);
                    item.description = response.code === 200 ? response.result.content : item.description;
                }

                return item;
            })
        )
    );

    return {
        title: `开源中国-${config.name}`,
        description: config.description,
        link: `${baseUrl}/?type=${category}`,
        image: config.logo,
        language: 'zh-CN' as const,
        item: items,
    };
}
