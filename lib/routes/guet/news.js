const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.guet.edu.cn';
const infos = {
    gdyw: {
        path: '/xwzx/gdyw.htm',
        title: '桂电要闻',
    },
    wmxyjs: {
        path: '/xwzx/wmxyjs.htm',
        title: '文明校园建设',
    },
    gdxw: {
        path: '/xwzx/gdxw.htm',
        title: '桂电新闻',
    },
    xykx: {
        path: '/xwzx/xykx.htm',
        title: '校园快讯',
    },
    xydt: {
        path: '/xwzx/xydt.htm',
        title: '学院动态',
    },
    mtgd: {
        path: '/xwzx/mtgd.htm',
        title: '媒体桂电',
    },
    tzgg: {
        path: '/xwzx/tzgg.htm',
        title: '通知公告',
    },
    zbgs: {
        path: '/xwzx/mtgd.htm',
        title: '招标公示',
    },
    xshd: {
        path: '/xwzx/tzgg.htm',
        title: '学术活动',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'gdyw';
    if (!infos[type]) {
        throw Error('参数不在可选范围之内');
    }
    const path = infos[type].path;

    const response = await got(path, {
        baseUrl: host,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('tr[id^="line"]').find('a');

    const item = await Promise.all(
        list
            .map(async (index, element) => {
                const href = $(element).attr('href');
                const path = href && href.replace(/\.\./, '');
                const link = host + path;

                const item = await ctx.cache.tryGet(link, async () => {
                    const result = await got.get(link);
                    const $ = cheerio.load(result.data);
                    const title = $('#newTitle').text();
                    const publish = $('.newsPublish').text();
                    const time = publish
                        .replace(/(发布时间：|日|分)/g, '')
                        .replace(/(年|月)/g, '-')
                        .replace(/时/g, ':');
                    const pubDate = new Date(`${time} GMT+0800`).toUTCString();
                    const description = $('div[id^="vsb_content"]').html();

                    const single = {
                        title: title,
                        link: link,
                        description: description,
                        pubDate: pubDate,
                    };
                    return single;
                });
                return Promise.resolve(item);
            })
            .get()
    );

    ctx.state.data = {
        title: infos[type].title,
        link: response.url,
        item: item,
    };
};
