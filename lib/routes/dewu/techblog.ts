import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const categoryMap: Record<string, string> = {
    1: '大前端',
    2: 'Java',
    3: '音视频',
    4: '测试',
    5: 'Golang',
    6: 'AI&数据',
    7: '运维&稳定生产',
    8: '技术思考',
};

export const route: Route = {
    path: '/techblog/:categoryId?',
    categories: ['programming'],
    example: '/dewu/techblog',
    parameters: { categoryId: '分类 ID，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['tech.dewu.com/'],
            target: '/techblog',
        },
    ],
    name: '技术博客',
    maintainers: ['zhenlohuang'],
    handler,
    description: `| 分类 | ID |
| --- | --- |
| 大前端 | 1 |
| Java | 2 |
| 音视频 | 3 |
| 测试 | 4 |
| Golang | 5 |
| AI&数据 | 6 |
| 运维&稳定生产 | 7 |
| 技术思考 | 8 |`,
};

async function handler(ctx) {
    const categoryId = ctx.req.param('categoryId');

    const params: Record<string, string> = { page: '1' };
    if (categoryId) {
        params.category_id = categoryId;
    }

    const response = await ofetch('https://tech.dewu.com/api/v1/article', {
        query: params,
    });

    const items = response.data.data.map((item) => ({
        title: item.title,
        link: `https://tech.dewu.com/article?id=${item.id}`,
        description: item.html_content,
        pubDate: parseDate(item.created_at),
        author: item.operator,
        category: item.category_info?.name ? [item.category_info.name] : [],
        image: item.img_url,
    }));

    const categoryName = categoryId ? categoryMap[categoryId] : '';
    const titleSuffix = categoryName ? ` - ${categoryName}` : '';

    return {
        title: `得物技术博客${titleSuffix}`,
        link: 'https://tech.dewu.com',
        item: items,
    };
}
