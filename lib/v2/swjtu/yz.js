const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    sszs: {
        keyWord: '61E92EF67418DC54',
    },
};

const host = 'http://yz.swjtu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/vatuu/WebAction?setAction=newsList&viewType=secondStyle&selectType=smallType&keyWord=${type.keyWord}`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.second-right .title').text() || '研究生院';
    const list = $('.intro-detail .littleResultDiv');

    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.relativeInfo span').first().text();
            const itemTitle = item.find('a').first().text();
            const itemPath = item.find('a').first().attr('href');
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
                    if ($('.content-main').length > 0) {
                        description = $('.content-main').html().trim();
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
        title: `西南交通大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `西南交通大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
