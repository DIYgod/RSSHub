const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://cse.seu.edu.cn/';
const noticHost = 'http://cse.seu.edu.cn/CSE/UI/Notice/';

const map = new Map([
    ['xyxw', { title: '东南大学计算机技术与工程学院 -- 学院新闻', suffix: 'Notice.aspx?Notice_Type=0' }],
    ['tzgg', { title: '东南大学计算机技术与工程学院 -- 通知公告', suffix: 'Notice.aspx?Notice_Type=1' }],
    ['jwxx', { title: '东南大学计算机技术与工程学院 -- 教务信息', suffix: 'Notice.aspx?Notice_Type=2' }],
    ['jyxx', { title: '东南大学计算机技术与工程学院 -- 就业信息', suffix: 'Notice.aspx?Notice_Type=3' }],
    ['xgsw', { title: '东南大学计算机技术与工程学院 -- 学工事务', suffix: 'Notice.aspx?Notice_Type=4' }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.type || 'xyxw';
    const suffix = map.get(type).suffix;

    const link = url.resolve(noticHost, suffix);
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const list = $('table.datatable tbody tr')
        .slice(0, 10)
        .map(function() {
            const info = {
                title: $(this)
                    .find('td:nth-child(1) a')
                    .attr('title'),
                link: $(this)
                    .find('td:nth-child(1) a')
                    .attr('href'),
                date: $(this)
                    .find('td:nth-child(2) span')
                    .text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = url.resolve(noticHost, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: title,
                link: itemUrl,
                description: $('.notice-content-wrapper')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .trim(),
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
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
