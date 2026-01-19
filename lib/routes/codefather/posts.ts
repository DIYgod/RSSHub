import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const validCategories = new Set(['交流', '学习', '项目', '资源', '经验']);

const sortFieldMap: Record<string, { field: string; name: string }> = {
    hot: { field: 'thumbNum', name: '热门' },
    new: { field: 'createTime', name: '最新' },
    recommend: { field: 'recommendTime', name: '推荐' },
};

export const route: Route = {
    path: '/posts/:sort?/:category?',
    categories: ['programming'],
    example: '/codefather/posts/hot',
    parameters: {
        sort: '排序方式，可选 `hot`（热门）、`new`（最新）、`recommend`（推荐），默认为 `hot`',
        category: '分类，可选 `交流`、`学习`、`项目`、`资源`、`经验`，默认为全部',
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
            source: ['www.codefather.cn/', 'www.codefather.cn'],
            target: '/posts/hot',
        },
    ],
    name: '帖子',
    maintainers: ['JackyST0'],
    handler,
    description: '获取编程导航社区的帖子，支持按热门、最新、推荐排序，支持按分类筛选。',
};

async function handler(ctx) {
    const sort = ctx.req.param('sort') || 'hot';
    const category = ctx.req.param('category');

    const sortConfig = sortFieldMap[sort] || sortFieldMap.hot;

    const requestBody: Record<string, unknown> = {
        current: 1,
        pageSize: 20,
        sortField: sortConfig.field,
        sortOrder: 'descend',
    };

    if (category && validCategories.has(category)) {
        requestBody.category = category;
    }

    const response = await ofetch('https://api.codefather.cn/api/post/list/page/vo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': config.trueUA,
        },
        body: requestBody,
    });

    if (response.code !== 0) {
        throw new Error(`API error: ${response.message}`);
    }

    const records = response.data?.records || [];

    const items = records.map((item: Record<string, unknown>) => {
        const content = (item.content as string) || '';
        const pictureList = (item.pictureList as string[]) || [];
        const user = (item.user as Record<string, unknown>) || {};
        const tags = (item.tags as Array<{ tagName: string }>) || [];

        // 构建描述内容
        let description = `<p>${content.replaceAll('\n', '<br>')}</p>`;

        // 添加图片
        if (pictureList.length > 0) {
            description += '<div>';
            for (const pic of pictureList) {
                description += `<img src="${pic}" style="max-width: 100%;" />`;
            }
            description += '</div>';
        }

        // 添加统计信息
        description += `<p><small>👍 ${item.thumbNum} | 👁 ${item.viewNum} | 💬 ${item.commentNum}</small></p>`;

        return {
            title: content.split('\n')[0].slice(0, 100) || '无标题',
            link: `https://www.codefather.cn/post/${item.id}`,
            description,
            pubDate: parseDate(item.createTime as number),
            author: user.userName as string,
            category: [item.category as string, ...tags.map((t) => t.tagName)].filter(Boolean),
        };
    });

    const categoryName = category ? `${category} - ` : '';
    const sortName = sortConfig.name;

    return {
        title: `编程导航 - ${categoryName}${sortName}帖子`,
        link: 'https://www.codefather.cn/',
        description: `编程导航社区${categoryName}${sortName}帖子`,
        item: items,
    };
}
