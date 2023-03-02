const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://jwc.njupt.edu.cn';

const map = {
    notice: '/1594',
    news: '/1596',
};

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'notice';
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
        urlList.map((itemUrl, index) => {
            itemUrl = new URL(itemUrl, host).href;
            if (itemUrl.indexOf('.htm') !== -1) {
                return ctx.cache.tryGet(itemUrl, async () => {
                    const response = await got.get(itemUrl);
                    if (response.redirectUrls.length !== 0) {
                        const single = {
                            title: titleList[index],
                            link: itemUrl,
                            description: '该通知无法直接预览, 请点击原文链接↑查看',
                            pubDate: parseDate(dateList[index]),
                        };
                        return single;
                    }
                    const $ = cheerio.load(response.data);
                    const single = {
                        title: $('.Article_Title').text(),
                        link: itemUrl,
                        description: $('.wp_articlecontent')
                            .html()
                            .replace(/src="\//g, `src="${new URL('.', host).href}`)
                            .replace(/href="\//g, `href="${new URL('.', host).href}`)
                            .trim(),
                        pubDate: parseDate($('.Article_PublishDate').text().replace('发布时间：', '')),
                    };
                    return single;
                });
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '该通知为文件，请点击原文链接↑下载',
                    pubDate: parseDate(dateList[index]),
                };
                return single;
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
