const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

// 反爬严格，需要puppeteer
// 相关文件及文档均未更新

const host = 'https://graduate.sysu.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/zsw/${type}`;
    const response = await got({
        method: 'get',
        url: pageUrl,
        headers: {
            Referer: pageUrl,
            Host: 'graduate.sysu.edu.cn',
            Cookie: `ZMRhjlxmTSDe443S=eN3tf6biS0EJcEOE6f65hZtIfcrCSqNgwnBXJILPEMO7_SsjOGphPDtH_uWrB4yI; _pk_ses.71.55be=1; _pk_id.71.55be=ed679eb623ea1638.1682405431.1.1682406115.1682405431.; ZMRhjlxmTSDe443T=59PDSRvc.WOXmW5FMjJqqEaQEyvyjqFf3yQ9u9jIgwd7Ieb9J57.qAOURoqSZ9ToAFfXNHvRZ3y7vht0IgSF.XCMSvxnPMn.4RWE7hlQ0kmQGmxR8F3l6ma9t9Zfv2RpZ.f8M8z8IN8khwMzchXP51wMdiUi648gvgKVh6svcBEX6yVzgaR9DTe1fWoOQ6VEI0XMHfWBDH49NxoqEqqWbZ88dOkN4lvgIJmS_DItJ4wvbZ3oBduvMtK97O5EVBAXWcO2XQQws5c8NSD4xs_Pzc26m6xcaxBbj409mP_FLKFtcmDnJCCRyGuPYsFEPMG3xG90q2e1hcuHrDNUl9QjLAWYBt63cjcZjhdohZV2ojbWestQwGI3wuaBuijdkYYolKl3`,
        },
    });
    const $ = cheerio.load(response.data);
    const typeName = $('.title-inner').text() || '研究生招生网';
    const list = $('.list-content li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            // 去除日期中的【】
            const itemDate = item.find('.date').text();
            const itemTitle = item.find('a p').text();
            const itemPath = item.find('a').attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('.block-region-right').length > 0) {
                        description = $('.block-region-right').html().trim();
                    } else {
                        description = itemTitle;
                    }
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `中山大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `中山大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
