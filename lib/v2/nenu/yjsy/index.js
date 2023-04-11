const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yjsy.nenu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.n_left  h2').text() || '研究生学院';
    const list = $('.n_right .list li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            // const itemDate = item.find('.time').text();
            const itemTitle = item.find('.tit').text();
            const itemPath = item.find('.tit').attr('href');
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
                    if ($('#vsb_content').length > 0) {
                        description = $('#vsb_content').html().trim();
                    } else {
                        description = itemTitle;
                    }

                    if ($('form[name=_newscontent_fromname] h3 span').eq(1)) {
                        const dateStr = $('form[name=_newscontent_fromname] h3 span').eq(1).text();
                        itemDate = dateStr.split('：')[1];
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
        title: `东北师范大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `东北师范大学研究生院 - ${typeName}`,
        item: items,
    };
};
