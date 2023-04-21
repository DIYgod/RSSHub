const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://gra.njtech.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('#mainRight .title .fl').text() || '研究生院';
    const list = $('#mainRight ul li');

    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);

            const itemDate = item.find('span').text();
            const itemTitle = item.find('a').text();
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
                    if ($('#vsb_content .v_news_content').length > 0) {
                        description = $('#vsb_content .v_news_content').html().trim();
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
        title: `南京工业大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `南京工业大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
