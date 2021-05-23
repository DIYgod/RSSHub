const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://cse.seu.edu.cn/';

const map = new Map([
    ['xyxw', { title: '东南大学计算机技术与工程学院 -- 学院新闻', suffix: '22535/list.htm' }],
    ['tzgg', { title: '东南大学计算机技术与工程学院 -- 通知公告', suffix: '22536/list.htm' }],
    ['jwxx', { title: '东南大学计算机技术与工程学院 -- 教务信息', suffix: '22538/list.htm' }],
    ['jyxx', { title: '东南大学计算机技术与工程学院 -- 就业信息', suffix: '22537/list.htm' }],
    ['xgsw', { title: '东南大学计算机技术与工程学院 -- 学工事务', suffix: '22539/list.htm' }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.type || 'xyxw';
    const suffix = map.get(type).suffix;

    const link = url.resolve(host, suffix);
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $('table.wp_article_list_table tbody tr td > table > tbody > tr')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('div.news_title.fl > a').attr('title'),
                link: $(this).find('div.news_title.fl > a').attr('href'),
                date: $(this).find('div.news_time.fr').text(),
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

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: title,
                link: itemUrl,
                description: $('div.wp_articlecontent')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .trim(),
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        link: link,
        title: map.get(type).title,
        description: '东南大学计算机技术与工程学院RSS',
        item: out,
    };
};
