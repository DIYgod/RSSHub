const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yanzhao.bjut.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.zt_tit').text() || '研究生招生网';
    const list = $('.linebg table').last().find('a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            // const itemDate = item.find('.blog-meta').text().trim().slice(6, 16);
            // const aTag = item.find('a').first();
            const itemTitle = item.text();
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
                    if ($('#vsb_content .v_news_content').length > 0) {
                        description = $('#vsb_content .v_news_content').html().trim();
                    }
                    if ($('hr').parent().text()) {
                        itemDate = $('hr').parent().text().trim().slice(5, 15);
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
        title: `北京工业大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `北京工业大学研究生院 - ${typeName}`,
        item: items,
    };
};
