const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://yjszs.yzu.edu.cn/';

const map = new Map([
    ['tzgg', { title: '扬州大学研究生招生 -- 通知公告', suffix: 'col/col37091/index.html', id: 37091 }],
    ['bszs', { title: '扬州大学研究生招生 -- 博士招生', suffix: 'col/col37129/index.html', id: 37129 }],
    ['sszs', { title: '扬州大学研究生招生 -- 硕士招生', suffix: 'col/col37130/index.html', id: 37130 }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const suffix = map.get(type).suffix;

    const link = url.resolve(host, suffix);
    const response = await got({
        method: 'post',
        url: 'http://yjszs.yzu.edu.cn/module/web/jpage/dataproxy.jsp?startrecord=1&endrecord=10&perpage=10',
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
                return Promise.resolve(JSON.parse(cache));
            }

            let description;
            if (itemUrl.indexOf('yzu.edu.cn/art') !== -1) {
                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);
                description = $('#zoom')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .trim();
            } else {
                description = '站外链接无法抓取全文';
            }

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: map.get(type).title,
        link: link,
        description: '扬州大学研究生招生 RSS',
        item: out,
    };
};
