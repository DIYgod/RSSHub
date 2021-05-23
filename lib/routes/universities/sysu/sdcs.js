const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://sdcs.sysu.edu.cn/',
        headers: {
            Referer: `http://sdcs.sysu.edu.cn/`,
        },
    });
    const $ = cheerio.load(response.data);

    // 首页有多个板块，每个板块的css选择器不同，而且每个板块的信息分类也不一样
    const block_index = [
        {
            index: 1,
            description_header: '学院新闻',
        },
        {
            index: 2,
            description_header: '学院通知',
        },
        {
            index: 3,
            description_header: '人才招聘',
        },
        {
            index: 4,
            description_header: '学术活动',
        },
        {
            index: 5,
            description_header: '学工通知',
        },
        {
            index: 6,
            description_header: '学生活动',
        },
        {
            index: 7,
            description_header: '教务通知',
        },
        {
            index: 8,
            description_header: '科研通知',
        },
        {
            index: 9,
            description_header: '人事通知',
        },
        {
            index: 10,
            description_header: '党群工作',
        },
        {
            index: 11,
            description_header: '校友工作',
        },
        {
            index: 12,
            description_header: '社会工作',
        },
    ];

    function getDetail(item, description_header) {
        return {
            title: description_header + ': ' + item.attribs.title,
            description: description_header + ': ' + item.attribs.title,
            link: item.attribs.href,
            category: description_header,
        };
    }

    const item_data = [];
    for (let i = 0; i < block_index.length; i++) {
        const block_news = $('#block-views-homepage-block-' + block_index[i].index + '> div > div.view-content > div > ul > li > a');
        for (let j = 0; j < block_news.length; j++) {
            item_data.push(getDetail(block_news[j], block_index[i].description_header));
        }
    }

    function compareLink(a, b) {
        let a_str = a.link;
        a_str = a_str.substr(a_str.length - 4, 4);
        const a_int = parseInt(a_str);
        let b_str = b.link;
        b_str = b_str.substr(b_str.length - 4, 4);
        const b_int = parseInt(b_str);
        return b_int - a_int;
    }
    // 使得新的通知排在前面，假设通知的发布和链接地址是相关的，而且链接地址都是"/content/4961"这样，只有四位数的。
    item_data.sort(compareLink);
    // console.log(item_data);

    ctx.state.data = {
        title: `中山大学 - 数据科学与计算机学院`,
        link: `http://sdcs.sysu.edu.cn`,
        description: `中山大学 - 数据科学与计算机学院`,
        language: `zh-cn`,
        item: item_data,
    };
};
