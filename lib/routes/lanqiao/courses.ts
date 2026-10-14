import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import utils from './utils';

export const route: Route = {
    path: '/courses/:sort/:tag',
    categories: ['programming'],
    example: '/lanqiao/courses/latest/all',
    parameters: { sort: '排序规则 sort, 默认(`default`)、最新(`latest`)、最热(`hotest`)', tag: '课程标签 `tag`，可在该页面找到：https://www.lanqiao.cn/courses/' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '全站发布的课程',
    maintainers: ['huhuhang'],
    handler,
};

async function handler(ctx) {
    const sort = ctx.req.param('sort');
    const tag = ctx.req.param('tag');
    // Fetch the source API response.
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/courses/?sort=${sort}&tag=${tag}&include=name,description,picture_url,id`,
    });

    const data = response.data.results; // The source API response data.
    const md = new MarkdownIt();

    // Course fee types.
    const courseType = {
        free: '免费课',
        member: '会员课',
        limit_free: '限时免费',
        louplus: '楼+',
        bootcamp: '训练营',
        private: '私有课',
        exam: '考试',
    };

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
                title: `${course.name} [${courseType[course.fee_type]}]`,
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

    // Supported sort orders.
    const sortType = {
        latest: '最新',
        hotest: '最热',
        default: '默认',
    };

    return {
        // Feed title.
        title: `蓝桥云课${sortType[sort]}课程列表【${tag}】`,
        // Feed link.
        link: `https://www.lanqiao.cn/courses/?sort=${sort}&tag=${tag}`,
        // Feed description.
        description: `蓝桥云课【${tag}】标签下${sortType[sort]}课程列表`,
        // Return the collected entries.
        item: items,
    };
}
