import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import utils from './utils';

async function getUserName(uid) {
    // 获取用户信息
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
    const userName = await getUserName(uid);
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/users/${uid}/courses/?type=published`,
        headers: {
            Referer: `https://www.lanqiao.cn/users/${uid}/`,
        },
    });

    const data = response.data.results; // response.data 为 HTTP GET 请求返回的数据对象

    const md = new MarkdownIt();
    const items = await Promise.all(
        data.map((item) =>
            cache.tryGet(`https://www.lanqiao.cn/api/v2/courses/${item.id}/`, async () => {
                const courseResponse = await got({
                    method: 'get',
                    url: `https://www.lanqiao.cn/api/v2/courses/${item.id}/`,
                });
                const course = courseResponse.data;

                item.title = course.name;
                item.description = utils.courseDesc(course.picture_url, md.render(course.long_description));
                item.author = course.teacher.name;
                item.link = `https://www.lanqiao.cn/courses/${course.id}/`;
                return item;
            })
        )
    );

    return {
        // 源标题
        title: `${userName} 发布的课程`,
        // 源链接
        link: `https://www.lanqiao.cn/users/${uid}`,
        // 源说明
        description: `${userName} 发布的课程`,
        // 遍历此前获取的数据
        item: items,
    };
}
