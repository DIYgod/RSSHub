const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'http://zkb.xynu.edu.cn/';
    const categoryList = [
        // 分类栏目
        'zkzy', // 主考专业
        'gzzd', // 规章制度
        'sjkc', // 实践课程
        'bylw', // 毕业论文
        'xsxw', // 学士学位
        'zkby', // 自考毕业
        'zkjc', // 自考教材
        'zkzn', // 自考指南
        'lxwm', // 联系我们
        // 首页板块
        'zkzx', // 自考资讯
        'bmzn', // 报名指南
        'rcap', // 日程安排
        'xsrm', // 新生入门
        'zkmk', // 转考免考
        'fxzl', // 复习资料
    ];
    const category = ctx.params.category;
    const path = categoryList.includes(category) ? `${category}.htm` : 'zkzx.htm';

    const response = await got({
        method: 'get',
        url: baseUrl + path,
    });

    const $ = cheerio.load(response.data);
    const list = $('.gg ul > li');
    const categoryTitle = $('title').text();

    ctx.state.data = {
        title: categoryTitle,
        link: baseUrl + path,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    let link = item.find('a').attr('href');
                    if (!link.startsWith('http')) {
                        link = baseUrl + link;
                    }
                    return {
                        title: item.find('a').text(),
                        description: item.find('a').text(),
                        link,
                        pubDate: item.find('span').text(),
                    };
                })
                .get(),
    };
};
