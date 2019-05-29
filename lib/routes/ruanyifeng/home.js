const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://www.ruanyifeng.com/blog/archives.html',
        headers: {
            Referer: 'https://www.ruanyifeng.com/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#alpha .module-categories .module-list li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '阮一峰博客',
        link: 'https://www.ruanyifeng.com/blog/archives.html',
        description: '阮一峰的网络日志  ： 全部文章（按分类查看）',
        item: result,
    };
};
