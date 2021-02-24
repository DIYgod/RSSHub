const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const link = 'http://tsg.gzmtu.edu.cn/'; // 图书馆URL
    const response = await got.get(link); // 获取HTML
    const data = response.data; // 请求返回的HTML
    const $ = cheerio.load(data); // cheerio加载数据
    const list = $('ul .picture_ul').find('li').get(); // 筛选出每则通知作为列表索引
    const result = await utils.ProcessFeed(list, ctx.cache, link); // 加载每则通知详情内容

    ctx.state.data = {
        title: '广州航海学院图书馆通知公告', // RSS名称
        description: '广州航海学院图书馆公告消息、资源动态、业界关注 RSS by SkYe231', // RSS描述
        link: link, // RSS源站URL
        item: result, // 文章具体内容
        allowEmpty: false, // 是否允许RSS内容为空
        language: 'zh-cn', // 频道语言
    };
};
