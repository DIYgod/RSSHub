const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://www.yzu.edu.cn/';

const map = new Map([
    ['xxyw', { title: '扬州大学 -- 学校要闻', suffix: 'col/col37745/index.html', id: 37745 }],
    ['xyxw', { title: '扬州大学 -- 校园新闻', suffix: 'col/col37746/index.html', id: 37746 }],
    ['xxgg', { title: '扬州大学 -- 信息公告', suffix: 'col/col37747/index.html', id: 37747 }],
    ['xshd', { title: '扬州大学 -- 学术活动', suffix: 'col/col37748/index.html', id: 37748 }],
    ['mtyd', { title: '扬州大学 -- 媒体扬大', suffix: 'col/col45661/index.html', id: 45661 }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const suffix = map.get(type).suffix;

    const link = url.resolve(host, suffix);
    const response = await got({
        method: 'post',
        url: 'http://www.yzu.edu.cn/module/web/jpage/dataproxy.jsp?startrecord=1&endrecord=10&perpage=10',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Accept: 'application/xml',
        },
        data: `columnid=${map.get(type).id}&unitid=54996`,
    });
    const $ = cheerio.load(response.data, { xmlMode: true });

    const list = $('record')
        .slice(0, 10)
        .map(function () {
            const $$ = cheerio.load($(this).html());
            const info = {
                title: $$('a').attr('title'),
                link: $$('a').attr('href'),
                date: $$('span').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = url.resolve(host, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            let description;
            if (itemUrl.includes('yzu.edu.cn/art')) {
                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);
                description = $('#zoom')
                    .html()
                    .replaceAll('src="/', `src="${url.resolve(host, '.')}`)
                    .trim();
            } else {
                description = '站外链接无法抓取全文';
            }

            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: map.get(type).title,
        link,
        description: '扬州大学 RSS',
        item: out,
    };
};
