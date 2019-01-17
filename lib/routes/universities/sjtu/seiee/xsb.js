const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://xsb.seiee.sjtu.edu.cn';
const config = {
    news: {
        link: `xsb/list/2938-1-20.htm`,
        title: '新闻发布',
    },
    scholarship: {
        link: `xsb/list/611-1-20.htm`,
        title: '奖学金',
    },
    activity: {
        link: `xsb/list/2676-1-20.htm`,
        title: '党团活动',
    },
    lecture: {
        link: `xsb/list/1981-1-20.htm`,
        title: '讲座活动',
    },
    all: {
        link: `xsb/list/705-1-20.htm`,
        title: '信息通告',
    },
    financialAid: {
        link: `xsb/list/1001-1-20.htm`,
        title: '助学金',
    },
};

module.exports = async (ctx) => {
    let type = ctx.params.type;
    type = type ? type : 'all';
    const link = url.resolve(host, config[type].link);
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const list = $('.list_box_5_2 li')
        .map((i, e) => ({
            date: $(e)
                .children('span')
                .text()
                .slice(1, -1),
            title: $(e)
                .children('a')
                .text()
                .slice(1),
            link: $(e)
                .children('a')
                .attr('href'),
        }))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const itemUrl = url.resolve(host, item.link);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);
            const single = {
                title: item.title,
                link: itemUrl,
                author: '上海交通大学电子信息与电气工程学院学生工作办公室',
                description: $('.article_box')
                    .text()
                    .slice(0, -7),
                pubDate: new Date(item.date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '上海交通大学电子信息与电气工程学院学生办 -- ' + config[type].title,
        link,
        item: out,
    };
};
