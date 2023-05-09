const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://graduate.bjfu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}/index.html`;
    const response = await got(pageUrl, {
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);
    const typeName = $('.newTitle').text() || '研究生院';
    const list = $('.itemList li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('span').last().text();
            const aTag = item.find('a');
            const itemTitle = aTag.attr('title');
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
                    const result = await got(itemUrl, { responseType: 'buffer' });
                    const resultData = iconv.decode(result.data, 'gb2312');
                    const $ = cheerio.load(resultData);
                    if ($('.articleTxt').length > 0) {
                        description = $('.articleTxt').html().trim();
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
        title: `北京林业大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `北京林业大学研究生院 - ${typeName}`,
        item: items,
    };
};
