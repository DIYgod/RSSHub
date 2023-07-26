const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://gs.djtu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/zs.asp?f_menu_id=${type}`;
    const response = await got({
        method: 'get',
        responseType: 'buffer', // 转码
        url: pageUrl,
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);
    const typeName = $('.totitle a').text() || '研究生院';
    const list = $('.infolist21 .info');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.sdate').text();
            const aTag = item.find('.stitle a');
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
                    if ($('.listword-px14-22').length > 0) {
                        description = $('.listword-px14-22').html().trim();
                        if ($('ul[style="list-style-type:none;"]').length > 0) {
                            description += $('ul[style="list-style-type:none;"]').html().trim();
                        }
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
        title: `大连交通大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `大连交通大学研究生院 - ${typeName}`,
        item: items,
    };
};
