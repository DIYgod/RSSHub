const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://gra.henau.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/plus/list.php?tid=${type}`;
    const response = await got({
        method: 'get',
        responseType: 'buffer', // 转码
        url: pageUrl,
    });
    const data = iconv.decode(response.data, 'gb2312'); // 转码
    const $ = cheerio.load(data);
    const typeName = $('.list_l h3').text() || '研究生院';
    const list = $('.list_r .list_box ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.datetime').text();
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
                    const result = await got({
                        method: 'get',
                        responseType: 'buffer', // 转码
                        url: itemUrl,
                    });
                    const data = iconv.decode(result.data, 'gb2312');
                    const $ = cheerio.load(data);
                    if ($('.content').length > 0) {
                        description = $('.content').html().trim();
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
        title: `河南农业大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `河南农业大学研究生院 - ${typeName}`,
        item: items,
    };
};
