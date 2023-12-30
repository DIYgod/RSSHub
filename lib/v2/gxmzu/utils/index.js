const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function getNoticeList(ctx, url, host, titleSelector, dateSelector, contentSelector) {
    const response = await got({ url, https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);

    const list = $(`tr[height=20]`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find(titleSelector).attr('title'),
                link: new URL(item.find(titleSelector).attr('href'), host).href,
                pubDate: timezone(parseDate(item.find(dateSelector).text().trim(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.includes('.jsp')) {
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const response = await got({ url: item.link, https: { rejectUnauthorized: false } });
                    if (response.redirectUrls.length) {
                        item.link = response.redirectUrls[0];
                        item.description = '该通知无法直接预览，请点击原文链接↑查看';
                    } else {
                        const $ = cheerio.load(response.data);
                        item.title = $(contentSelector.title).text();
                        const hasEmbeddedPDFScript = $('script:contains("showVsbpdfIframe")').length > 0;

                        if (hasEmbeddedPDFScript) {
                            item.description = '该通知无法直接预览，请点击原文链接↑查看';
                        } else {
                            item.description = $(contentSelector.content).html();
                        }
                        const preDate = $(contentSelector.date).text().replace(/年|月/g, '-').replace(/日/g, '');
                        item.pubDate = timezone(parseDate(preDate), +8);
                    }
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
