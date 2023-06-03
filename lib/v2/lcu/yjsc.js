const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsc.lcu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/index.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.g_nyfrtopfl2').text() || '研究生处';
    const list = $('.g_nyb2bot .g_nyb2nr a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            // const itemDate = item.find('span').text().replace(/\[|\]/g, '');
            // const aTag = item.find('a');
            const itemTitle = item.find('.g_nyb2nrsefl').text();
            const itemPath = item.attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                let itemDate = null;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('.g_b3bot').length > 0) {
                        description = $('.g_b3bot').html().trim();
                    } else {
                        description = itemTitle;
                    }
                    if ($('.g_b3topinfl1wz').length > 0) {
                        itemDate = $('.g_b3topinfl1wz').first().text().trim().slice(-10);
                    }
                } catch (e) {
                    description = itemTitle;
                }
                const resultData = {
                    title: itemTitle,
                    link: itemUrl,
                    description,
                };
                if (itemDate) {
                    resultData.pubDate = timezone(parseDate(itemDate), 8);
                }
                return resultData;
            });
        })
    );
    ctx.state.data = {
        title: `聊城大学研究生处 - ${typeName}`,
        link: pageUrl,
        description: `聊城大学研究生处 - ${typeName}`,
        item: items,
    };
};
