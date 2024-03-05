// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'latest';
    const id = ctx.req.param('id') ?? 14;

    const titles = {
        14: '热点 - 最新',
        5: '热点 - 科技',
        9: '热点 - 消费',
        7: '热点 - 出行',
        13: '热点 - 文娱',
        10: '热点 - 教育',
        25: '热点 - 地产',
        11: '热点 - 更多',
        28: '深度 - 出行',
        29: '深度 - 科技',
        31: '深度 - 消费',
        33: '深度 - 教育',
        34: '深度 - 更多',
        8: '深度 - 地产',
        6: '深度 - 文娱',
    };

    const categories = {
        latest: {
            url: '',
            title: '最新文章',
        },
        recommend: {
            url: '&isRecommend=true',
            title: '推荐资讯',
        },
        cover: {
            url: '&position=1',
            title: '封面文章',
        },
        information: {
            url: `&categoryId=${id}`,
            title: titles[id],
        },
    };

    const rootUrl = 'https://www.aicaijing.com.cn';
    const apiRootUrl = 'https://api.aicaijing.com.cn';
    const apiUrl = `${apiRootUrl}/article/detail/list?size=${ctx.req.query('limit') ?? 50}&page=1${categories[category].url}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.items.map((item) => ({
        title: item.title,
        link: `${rootUrl}/article/${item.articleId}`,
        author: item.userInfo.nickname,
        pubDate: parseDate(item.createTime),
        category: [item.category.name, ...item.tags.map((t) => t.name)],
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: item.cover,
            description: item.content,
        }),
    }));

    ctx.set('data', {
        title: `AI 财经社 - ${categories[category].title}`,
        link: rootUrl,
        item: items,
    });
};
