const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const getCookie = require('../utils/pypasswaf');
const host = 'https://cae.nuaa.edu.cn/';

const map = new Map([
    ['zhxw', { title: '综合新闻 | 南京航空航天大学自动化学院', suffix: '5399/list.htm' }],
    ['dwxz', { title: '党委行政 | 南京航空航天大学自动化学院', suffix: '13266/list.htm' }],
    ['rshz', { title: '人事/合作 | 南京航空航天大学自动化学院', suffix: '13267/list.htm' }],
    ['yjs', { title: '研究生培养 | 南京航空航天大学自动化学院', suffix: '13271/list.htm' }],
    ['bks', { title: '本科生培养 | 南京航空航天大学自动化学院', suffix: '13270/list.htm' }],
    ['xsgz', { title: '学生工作 | 南京航空航天大学自动化学院', suffix: '13268/list.htm' }],
    ['tzgg', { title: '通知公告 | 南京航空航天大学自动化学院', suffix: '13264/list.htm' }],
    ['xsxx', { title: '学术信息 | 南京航空航天大学自动化学院', suffix: '13265/list.htm' }],
    ['dbgg', { title: '答辩公告 | 南京航空航天大学自动化学院', suffix: 'dbgg/list.htm' }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const suffix = map.get(type).suffix;
    const getDescription = Boolean(ctx.params.getDescription) || false;
    const link = new URL(suffix, host).href;
    const cookie = await getCookie(host);
    const gotConfig = {
        headers: {
            cookie,
        },
    };
    const response = await got(link, gotConfig);
    const $ = cheerio.load(response.data);

    const list = $('#wp_news_w6 ul li')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('a').text(),
                link: $(this).find('a').attr('href'),
                date: $(this).find('span').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map((info) => {
            const title = info.title || 'zhxw';
            const date = info.date;
            const itemUrl = new URL(info.link, host).href;

            return ctx.cache.tryGet(itemUrl, async () => {
                const arr = itemUrl.split('.');
                const pageType = arr[arr.length - 1];

                // 南航新 WAF 过于敏感
                // 目前 description 需要遍历页面，会被 WAF 拦截导致无法输出
                // 考虑换一种获取 description 的方式或者将标题当作 title。
                let description = title + '<br><a href="' + itemUrl + '" target="_blank">查看原文</a>';
                if (getDescription) {
                    description = itemUrl;
                    if (pageType === 'htm' || pageType === 'html') {
                        const response = await got(itemUrl, gotConfig);
                        const $ = cheerio.load(response.data);
                        description = $('.wp_articlecontent').html() + '<br><hr /><a href="' + itemUrl + '" target="_blank">查看原文</a>';
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
        description: '南京航空航天大学自动化学院RSS',
        item: out,
    };
};
