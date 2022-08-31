const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const getCookie = require('../utils/pypasswaf');
const host = 'http://cs.nuaa.edu.cn/';

const map = new Map([
    ['tzgg', { title: '南京航空航天大学计算机科学与技术学院 -- 通知公告', suffix: 'tzgg/list.htm' }],
    ['rdxw', { title: '南京航空航天大学计算机科学与技术学院 -- 热点新闻', suffix: '10846/list.htm' }],
    ['xkky', { title: '南京航空航天大学计算机科学与技术学院 -- 学科科研', suffix: '10849/list.htm' }],
    ['be', { title: '南京航空航天大学计算机科学与技术学院 -- 本科生培养', suffix: '10850/list.htm' }],
    ['me', { title: '南京航空航天大学计算机科学与技术学院 -- 研究生培养', suffix: '10851/list.htm' }],
    ['jxdt', { title: '南京航空航天大学计算机科学与技术学院 -- 教学动态', suffix: '1977/list.htm' }],
    ['xsgz', { title: '南京航空航天大学计算机科学与技术学院 -- 学生工作', suffix: '1959/list.htm' }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const getDescription = Boolean(ctx.params.getDescription) || false;
    const suffix = map.get(type).suffix;

    const link = new URL(suffix, host).href;
    const cookie = await getCookie();
    const gotConfig = {
        headers: {
            cookie,
        },
    };
    const response = await got(link, gotConfig);
    const $ = cheerio.load(response.data);

    const list = $('#news_list ul li')
        .slice(0, Math.min(parseInt($('.per_count', '#wp_paging_w6').text()), parseInt($('.all_count', '#wp_paging_w6').slice(1).text())))
        .map(function () {
            const info = {
                title: $(this).find('a').attr('title'),
                link: $(this).find('a').attr('href'),
                date: $(this).find('span').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map((info) => {
            const title = info.title || 'tzgg';
            const date = info.date;
            const itemUrl = new URL(info.link, host).href;

            return ctx.cache.tryGet(itemUrl, async () => {
                const arr = itemUrl.split('.');
                const pageType = arr[arr.length - 1];

                // 南航新 WAF 过于敏感
                // 目前 description 需要遍历页面，会被 WAF 拦截导致无法输出
                // 考虑换一种获取 description 的方式或者将标题当作 title。
                let description = title;
                if (getDescription) {
                    description = itemUrl;
                    if (pageType === 'htm' || pageType === 'html') {
                        const response = await got.get(itemUrl, gotConfig);
                        const $ = cheerio.load(response.data);
                        description = $('.wp_articlecontent')
                            .html()
                            .replace(/src="\//g, `src="${new URL('.', host).href}`)
                            .trim();
                    }
                }

                const single = {
                    title,
                    link: itemUrl,
                    description,
                    pubDate: parseDate(date),
                };
                return single;
            });
        })
    );

    ctx.state.data = {
        title: map.get(type).title,
        link,
        description: '南京航空航天大学计算机科学与技术学院RSS',
        item: out,
    };
};
