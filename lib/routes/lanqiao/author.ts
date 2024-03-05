// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const utils = require('./utils');
const MarkdownIt = require('markdown-it');

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

export default async (ctx) => {
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

    ctx.set('data', {
        // 源标题
        title: `${userName} 发布的课程`,
        // 源链接
        link: `https://www.lanqiao.cn/users/${uid}`,
        // 源说明
        description: `${userName} 发布的课程`,
        // 遍历此前获取的数据
        item: items,
    });
};
