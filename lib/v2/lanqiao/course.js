const got = require('@/utils/got');
const utils = require('./utils');
const dateParser = require('@/utils/dateParser');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/courses/?sort=latest&tag=${tag}&include=name,description,picture_url,id`,
    });

    const data = response.data.results; // response.data 为 HTTP GET 请求返回的数据对象
    // 这个对象中包含了数组名为 results，所以 response.data.results 则为需要的数据
    ctx.state.data = {
        // 源标题
        title: `蓝桥云课最新发布的课程(${tag})`,
        // 源链接
        link: `https://www.lanqiao.cn/courses/?tag=${tag}`,
        // 源说明
        description: `蓝桥云课 ${tag} 标签下最新发布的课程`,
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 课程名称
            title: item.name,
            // 课程介绍和封面
            description: utils.courseDesc(item.description, item.picture_url),
            pubDate: dateParser(new Date().toISOString()), // No Time for now
            // 课程链接
            link: `https://www.lanqiao.cn/courses/${item.id}`,
        })),
    };
};
