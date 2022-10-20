const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const url = 'https://jwc.njxzc.edu.cn/1985/list.htm';
const host = 'https://jwc.njxzc.edu.cn';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.body);

    const urlList = $('body')
        .find('span.Article_Title a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const titleList = $('body')
        .find('span.Article_Title a')
        .map((i, e) => $(e).text())
        .get();

    const dateList = $('body')
        .find('span.Article_PublishDate')
        .map((i, e) => $(e).text())
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
                            pubDate: timezone(parseDate(dateList[index]), +8),
                        };
                        return single;
                    }
                    const $ = cheerio.load(response.data);
                    const single = {
                        title: $('.articleTitle').text(),
                        link: itemUrl,
                        description: $('.wp_articlecontent')
                            .html()
                            .replace(/src="\//g, `src="${new URL('.', host).href}`)
                            .replace(/href="\//g, `href="${new URL('.', host).href}`)
                            .trim(),
                        pubDate: timezone(parseDate(dateList[index]), +8),
                    };
                    return single;
                });
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '该通知为文件，请点击原文链接↑下载',
                    pubDate: timezone(parseDate(dateList[index]), +8),
                };
                return single;
            }
        })
    );

    ctx.state.data = {
        title: '南京晓庄学院 -- 教务处教学运行',
        item: out,
    };
};
