const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function getNoticeList(ctx, url, host, listSelector, itemSelector, titleSelector, contentSelector) {
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const list = $(listSelector)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find(titleSelector).text(),
                link: host + item.find(itemSelector).attr('href'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                if (response.redirectUrls.length) {
                    item.link = response.redirectUrls[0];
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const $ = cheerio.load(response.data);
                    item.title = $(contentSelector.title).text();
                    item.description = $(contentSelector.content)
                        .html()
                        .replace(/src="\//g, `src="${new URL('.', host).href}`)
                        .replace(/href="\//g, `href="${new URL('.', host).href}`)
                        .trim();
                    const preDate = $(contentSelector.date)
                        .text()
                        .match(/(\d{4}-\d{2}-\d{2})/)[1];
                    item.pubDate = timezone(parseDate(preDate, 'YYYY-MM-DD'), +8);
                }
                return item;
            })
        )
    );

    return out;
}

module.exports = {
    getNoticeList,
};
