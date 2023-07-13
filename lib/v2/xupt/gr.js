const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://gr.xupt.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/xbwz/${type}.htm`;
    const response = await got(pageUrl, {
        https: { rejectUnauthorized: false },
        headers: {
            Referer: 'http://gr.xupt.edu.cn/xbwz/xbwz.htm',
            Host: 'gr.xupt.edu.cn',
        },
    });
    const $ = cheerio.load(response.data);
    const typeName = $('.dqwz a').last().text() || '研究生院';
    const list = $('list_lb ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item
                .find('span')
                .text()
                .replace(/&nbsp;/g, '')
                .replace(/年|月/g, '-')
                .replace(/日/g, '')
                .trim();
            const aTag = item.find('a');
            const itemTitle = aTag.attr('title') || aTag.text();
            const itemPath = aTag.attr('href');
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
                    if ($('#vsb_content').length > 0) {
                        description = $('#vsb_content').html().trim();
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
        title: `西安邮电大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `西安邮电大学研究生院 - ${typeName}`,
        item: items,
    };
};
