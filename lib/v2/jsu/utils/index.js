const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
function getPageItem(ctx, selector, pageUrl) {
    return ctx.cache.tryGet(pageUrl, async () => {
        const response = await got({
            method: 'get',
            url: pageUrl,
            UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            https: { rejectUnauthorized: false },
        });
        const $ = cheerio.load(response.data);
        const page = $(selector);

        return page ? page.html() : '无法获取内容';
    });
}

function getPageDetails(ctx, selector, pageUrl, titleSelector, dateSelector, dateHander = (date) => date) {
    return ctx.cache.tryGet(pageUrl, async () => {
        const response = await got({
            method: 'get',
            url: pageUrl,
            UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            https: { rejectUnauthorized: false },
        });
        const s = cheerio.load(response.data);
        const page = s(selector);
        const date = dateHander(s(dateSelector).text());
        const title = s(titleSelector).text();
        return page
            ? { pageInfo: page.html(), date, title }
            : {
                  pageInfo: '无法获取内容',
                  date: '1970年1月1日',
                  title: '无法获取标题',
              };
    });
}

module.exports = {
    getPageItem,
    getPageItemAndDate: getPageDetails,
};
