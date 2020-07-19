const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    xs: {
        title: '学术动态',
        url: 'http://www16.zzu.edu.cn/msgs/vmsgisapi.dll/vmsglist?mtype=x&lan=205',
    },
    mt: {
        title: '媒体郑大',
        url: 'http://www16.zzu.edu.cn/msgs/vmsgisapi.dll/vmsglist?mtype=x&lan=208',
    },
    zh: {
        title: '综合新闻',
        url: 'http://www16.zzu.edu.cn/msgs/vmsgisapi.dll/vmsglist?mtype=x&lan=202',
    },
    yx: {
        title: '院系风采',
        url: 'http://www16.zzu.edu.cn/msgs/vmsgisapi.dll/vmsglist?mtype=x&lan=206',
    },
    ky: {
        title: '教学科研',
        url: 'http://www16.zzu.edu.cn/msgs/vmsgisapi.dll/vmsglist?mtype=x&lan=203',
    },
    stu: {
        title: '学生信息',
        url: 'http://www16.zzu.edu.cn/msgs/vmsgisapi.dll/vmsglist?mtype=x&lan=204',
    },
    ws: {
        title: '外事信息',
        url: 'http://www16.zzu.edu.cn/msgs/vmsgisapi.dll/vmsglist?mtype=x&lan=209',
    },
};
async function getNewsDetail(link) {
    const res = await got.get(link);
    const $ = cheerio.load(res.data);
    return {
        author: $('.zzj_4 .zzj_f2').eq(1).text(),
        pubDate: new Date($('.zzj_4 .zzj_f2').eq(2).text()).toUTCString(),
        description: $('.zzj_5').html(),
    };
}

module.exports = async (ctx) => {
    const type = ctx.params.type || 'zh';
    const url = config[type].url;
    const title = config[type].title;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const out = await Promise.all(
        $('.zzj_5 .zzj_5a')
            .slice(0, 10)
            .map(async (i, v) => {
                const link = $(v).find('a').attr('href');
                const title = $(v).find('.zzj_f6_c').text();
                const single = {
                    title,
                    link,
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
        title: `郑州大学新闻网 -- ${title}`,
        link: 'http://news.zzu.edu.cn/',
        item: out,
    };
};
