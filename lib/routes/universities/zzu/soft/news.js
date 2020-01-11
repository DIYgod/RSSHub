const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    xyxw: {
        title: '学院新闻',
        url: 'http://www5.zzu.edu.cn/soft/xyxw.htm',
    },

    xygg: {
        title: '学院公告',
        url: 'http://www5.zzu.edu.cn/soft/xygg.htm',
    },

    xsgz: {
        title: '学生工作',
        url: 'http://www5.zzu.edu.cn/soft/xsgz.htm',
    },
};
async function getNewsDetail(link) {
    const res = await got.get(link);
    const $ = cheerio.load(res.data);
    return {
        author: '软件学院',
        description: $('.article_content').html(),
    };
}

module.exports = async (ctx) => {
    const type = ctx.params.type || 'xyxw';
    const url = config[type].url;
    const title = config[type].title;
    const BaseURL = 'http://www5.zzu.edu.cn/soft/';

    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const out = await Promise.all(
        $('.list .span8')
            .slice(0, 10)
            .map(async (i, v) => {
                const link =
                    BaseURL +
                    $(v)
                        .find('a')
                        .attr('href');
                const title = $(v)
                    .find('a')
                    .text();
                const pubDate = new Date(
                    $(v)
                        .find('.fr')
                        .text()
                ).toUTCString();
                const single = {
                    link,
                    title,
                    pubDate,
                };
                let other = {};
                const cache = await ctx.cache.get(link);
                if (cache) {
                    other = JSON.parse(cache);
                } else {
                    other = await getNewsDetail(link);
                    ctx.cache.set(link, JSON.stringify(other));
                }

                return Promise.resolve(Object.assign({}, single, other));
            })
            .get()
    );
    ctx.state.data = {
        title: `郑州大学软件学院 -- ${title}`,
        link: 'http://www5.zzu.edu.cn/soft/index.htm',
        item: out,
    };
};
