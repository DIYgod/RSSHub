import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { header } from './utils';

// 参考：https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90
// 文章给出了v7版 api的信息，包含全文api

export const route: Route = {
    path: '/daily/section/:sectionId',
    categories: ['social-media'],
    example: '/zhihu/daily/section/2',
    parameters: { sectionId: '合集 id，可在 https://news-at.zhihu.com/api/7/sections 找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['daily.zhihu.com/*'],
            target: '/daily',
        },
    ],
    name: '知乎日报 - 合集',
    maintainers: ['ccbikai'],
    handler,
    url: 'daily.zhihu.com/*',
};

async function handler(ctx) {
    const sectionId = ctx.req.param('sectionId');
    const listRes = await ofetch(`https://news-at.zhihu.com/api/7/section/${sectionId}`, {
        headers: {
            ...header,
            Referer: `https://news-at.zhihu.com/api/7/section/${sectionId}`,
        },
    });
    // 根据api的说明，过滤掉极个别站外链接
    const storyList = listRes.stories.filter((el) => el.url.startsWith('https://daily.zhihu.com/'));
    const resultItem = await Promise.all(
        storyList.map(async (story) => {
            const url = 'https://news-at.zhihu.com/api/7/news/' + story.id;

            const storyJson = await cache.tryGet(url, async () => {
                const response = await ofetch(url);
                return response;
            });

            const storyTitle = storyJson.title;
            const storyContent = storyJson.body;

            return {
                title: storyTitle,
                description: storyContent,
                link: storyJson.url,
                pubDate: parseDate(storyJson.publish_time, 'X'),
            };
        })
    );

    return {
        title: `${listRes.name} - 知乎日报`,
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        image: 'http://static.daily.zhihu.com/img/new_home_v3/mobile_top_logo.png',
        item: resultItem,
    };
}
