import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import utils from './utils';

async function getUsername(uid) {
    // Fetch the user profile.
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/users/${uid}/`,
        headers: {
            Referer: `https://www.lanqiao.cn/users/${uid}/`,
        },
    });

    return response.data.name;
}

export const route: Route = {
    path: '/author/:uid',
    categories: ['programming'],
    example: '/lanqiao/author/1701267',
    parameters: { uid: '作者 `uid` 可在作者主页 URL 中找到' },
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
            source: ['lanqiao.cn/users/:uid'],
        },
    ],
    name: '作者发布的课程',
    maintainers: ['huhuhang'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const username = await getUsername(uid);
    // Fetch the source API response.
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/users/${uid}/courses/?type=published`,
        headers: {
            Referer: `https://www.lanqiao.cn/users/${uid}/`,
        },
    });

    const data = response.data.results; // The source API response data.

    const md = new MarkdownIt();
    const items = await pMap(
        data,
        async (item: Record<string, unknown>) => {
            const course = await cache.tryGet(`lanqiao:course:${item.id}`, async () => {
                const courseResponse = await got({
                    method: 'get',
                    url: `https://www.lanqiao.cn/api/v2/courses/${item.id}/`,
                });
                return courseResponse.data;
            });
            return {
                ...item,
                title: course.name,
                description: utils.courseDesc(course.picture_url, md.render(course.long_description || course.description || '')),
                author: course.teacher.name,
                category: course.tags,
                pubDate: course.open_time ? parseDate(course.open_time) : undefined,
                updated: course.updated_time ? parseDate(course.updated_time) : undefined,
                link: `https://www.lanqiao.cn/courses/${course.id}/`,
            };
        },
        { concurrency: 3 }
    );

    return {
        // Feed title.
        title: `${username} 发布的课程`,
        // Feed link.
        link: `https://www.lanqiao.cn/users/${uid}`,
        // Feed description.
        description: `${username} 发布的课程`,
        // Return the collected entries.
        item: items,
    };
}
