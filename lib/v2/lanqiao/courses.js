const got = require('@/utils/got');
const utils = require('./utils');
const MarkdownIt = require('markdown-it');

module.exports = async (ctx) => {
    const sort = ctx.params.sort;
    const tag = ctx.params.tag;
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/courses/?sort=${sort}&tag=${tag}&include=name,description,picture_url,id`,
    });

    const data = response.data.results; // response.data 为 HTTP GET 请求返回的数据对象
    const md = new MarkdownIt();

    // 课程类型
    const courseType = {
        free: '免费课',
        member: '会员课',
        limit_free: '限时免费',
        louplus: '楼+',
        bootcamp: '训练营',
        private: '私有课',
        exam: '考试',
    };

    const items = await Promise.all(
        data.map((item) =>
            ctx.cache.tryGet(`https://www.lanqiao.cn/api/v2/courses/${item.id}/`, async () => {
                const courseResponse = await got({
                    method: 'get',
                    url: `https://www.lanqiao.cn/api/v2/courses/${item.id}/`,
                });
                const course = courseResponse.data;
                item.title = `${course.name} [${courseType[course.fee_type]}]`;
                item.description = utils.courseDesc(course.picture_url, md.render(course.long_description));
                item.author = course.teacher.name;
                item.link = `https://www.lanqiao.cn/courses/${course.id}/`;
                return item;
            })
        )
    );

    // 排序规则
    const sortType = {
        latest: '最新',
        hotest: '最热',
        default: '默认',
    };

    ctx.state.data = {
        // 源标题
        title: `蓝桥云课${sortType[sort]}课程列表【${tag}】`,
        // 源链接
        link: `https://www.lanqiao.cn/courses/?sort=${sort}&tag=${tag}`,
        // 源说明
        description: `蓝桥云课【${tag}】标签下${sortType[sort]}课程列表`,
        // 遍历此前获取的数据
        item: items,
    };
};
