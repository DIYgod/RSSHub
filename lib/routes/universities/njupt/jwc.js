const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://jwc.njupt.edu.cn';

const map = {
    notice: '/1594',
    news: '/1596',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'notice';
    const link = host + map[type] + '/list.htm';
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const $ = cheerio.load(response.data);

    const urlList = $('.content')
        .find('a')
        .slice(0, 10)
        .map((i, e) => $(e).attr('href'))
        .get();

    const titleList = $('.content')
        .find('a')
        .slice(0, 10)
        .map((i, e) => $(e).attr('title'))
        .get();

    const dateList = $('.content tr')
        .find('div')
        .slice(0, 10)
        .map((i, e) => $(e).text().replace('发布时间：', ''))
        .get();

    const out = await Promise.all(
        urlList.map(async (itemUrl, index) => {
            itemUrl = url.resolve(host, itemUrl);
            if (itemUrl.indexOf('.htm') !== -1) {
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);
                const single = {
                    title: $('.Article_Title').text(),
                    link: itemUrl,
                    description: $('.wp_articlecontent')
                        .html()
                        .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                        .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                        .trim(),
                    pubDate: new Date($('.Article_PublishDate').text().replace('发布时间：', '')).toUTCString(),
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '该通知为文件，请点击原文链接↑下载',
                    pubDate: new Date(dateList[index]).toUTCString(),
                };
                return Promise.resolve(single);
            }
        })
    );
    let info = '通知公告';
    if (type === 'news') {
        info = '教务快讯';
    }
    ctx.state.data = {
        title: '南京邮电大学 -- ' + info,
        link,
        item: out,
    };
};
