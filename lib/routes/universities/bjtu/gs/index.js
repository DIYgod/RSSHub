const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const struct = {
        zs: {
            selector: {
                list: '.mainleft_box li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/zszt/item/?tag=1',
            name: '招生 - 北京交通大学研究生院',
        },
        noti: {
            selector: {
                list: '.tab-content li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/item/?tag=2',
            name: '通知公告 - 北京交通大学研究生院',
        },
        news: {
            selector: {
                list: '.tab-content li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/item/?tag=3',
            name: '新闻动态 - 北京交通大学研究生院',
        },
        zsxc: {
            selector: {
                list: '.tab-content li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/item/?tag=4',
            name: '招生宣传 - 北京交通大学研究生院',
        },
        py: {
            selector: {
                list: '.tab-content li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/item/?tag=5',
            name: '培养 - 北京交通大学研究生院',
        },
        xw: {
            selector: {
                list: '.tab-content li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/item/?tag=7',
            name: '学位 - 北京交通大学研究生院',
        },
        ygbtzgg: {
            selector: {
                list: '.tab-content li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/item/?tag=9',
            name: '通知公告 - 研工部 - 北京交通大学研究生院',
        },
        ygbnews: {
            selector: {
                list: '.tab-content li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/item/?tag=10',
            name: '新闻动态 - 研工部 - 北京交通大学研究生院',
        },
        all: {
            selector: {
                list: '.tab-content li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/item/?tag=12',
            name: '所有文章 - 北京交通大学研究生院',
        },
        bszs: {
            selector: {
                list: '.mainleft_box li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/zszt/item/?cat=2',
            name: '博士招生 - 北京交通大学研究生院',
        },
        sszs: {
            selector: {
                list: '.mainleft_box li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/zszt/item/?cat=3',
            name: '硕士招生 - 北京交通大学研究生院',
        },
        zsjz: {
            selector: {
                list: '.mainleft_box li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/zszt/item/?cat=4',
            name: '招生简章 - 北京交通大学研究生院',
        },
        zcfg: {
            selector: {
                list: '.mainleft_box li',
            },
            url: 'https://gs.bjtu.edu.cn/cms/zszt/item/?cat=5',
            name: '政策法规 - 北京交通大学研究生院',
        },
    };

    const url = struct[type].url;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $(struct[type].selector.list);

    ctx.state.data = {
        title: struct[type].name,
        link: url,
        description: '北京交通大学研究生院',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const date = new Date(Date.parse(item.find('li span').text().slice(1, 11).replace(/-/g, '/')));
                    const bj_date = date.getTime() / 1000 + 8 * 60 * 60;
                    const title = item
                        .find('li a')
                        .text()
                        .replace(/\[.*?\]/g, '');
                    return { title, description: title, link: item.find('li a').attr('href'), pubDate: new Date(parseInt(bj_date) * 1000) };
                })
                .get(),
    };
};
