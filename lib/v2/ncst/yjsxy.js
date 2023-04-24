const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsxy.ncst.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/col/${type}/index.html`;
    const response = await got({
        method: 'get',
        url: pageUrl,
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312'); // 转码
    const $ = cheerio.load(data);
    const typeName = $('.dqwz_size a').last().text() || '研究生院';
    const list = $('.tz-listbt');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.tz-listday').text();
            const itemTitle = item.find('a').attr('title');
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
                    const result = await got({
                        method: 'get',
                        url: itemUrl,
                        responseType: 'buffer',
                    });
                    const data = iconv.decode(result.data, 'gb2312'); // 转码
                    const $ = cheerio.load(data);
                    if ($('#conN div').length > 0) {
                        description = $('#conN div').html().trim();
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
        title: `华北理工大学研究生学院 - ${typeName}`,
        link: pageUrl,
        description: `华北理工大学研究生学院 - ${typeName}`,
        item: items,
    };
};
