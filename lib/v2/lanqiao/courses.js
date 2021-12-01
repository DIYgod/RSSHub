const got = require('@/utils/got');
const utils = require('./utils');
const dateParser = require('@/utils/dateParser');
const MarkdownIt = require('markdown-it');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/courses/?sort=latest&tag=${tag}&include=name,description,picture_url,id`,
    });

    const data = response.data.results; // response.data 为 HTTP GET 请求返回的数据对象
    const md = new MarkdownIt();
    const items = await Promise.all(
        data.map((item) =>
            ctx.cache.tryGet(`https://www.lanqiao.cn/api/v2/courses/${item.id}/`, async () => {
                const courseResponse = await got({
                    method: 'get',
                    url: `https://www.lanqiao.cn/api/v2/courses/${item.id}/`,
                });
                const course = courseResponse.data;

                item.title = course.name;
                item.description = utils.courseDesc(course.picture_url, md.render(course.long_description));
                item.author = course.teacher.name;
                item.pubDate = dateParser(course.end_time);
                item.link = `https://www.lanqiao.cn/courses/${course.id}/`;
                return item;
            })
        )
    );

    ctx.state.data = {
        // 源标题
        title: `蓝桥云课最新发布的课程(${tag})`,
        // 源链接
        link: `https://www.lanqiao.cn/courses/?tag=${tag}`,
        // 源说明
        description: `蓝桥云课 ${tag} 标签下最新发布的课程`,
        // 遍历此前获取的数据
        item: items,
    };
};
