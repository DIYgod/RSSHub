const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    tongzhigonggao: {
        key: 'tongzhigonggao',
        code: '103461',
        name: '通知公告',
    },
    zhaoshengdongtai: {
        key: 'zhaoshengdongtai',
        code: '103462',
        name: '招生动态',
    },
    shuoshisheng: {
        key: 'shuoshisheng',
        code: '103464',
        name: '硕士生',
    },
};

const host = 'https://yz.lzu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/yz/lm/${type.code}.js?timestamp=${new Date().getTime()}&_=${new Date().getTime()}`;
    const response = await got({
        method: 'get',
        url: pageUrl,
        headers: {
            Host: 'yz.lzu.edu.cn',
            Referer: `Referer: https://yz.lzu.edu.cn/${type.key}/index.html`,
        },
    });
    // 截取前20条数据
    const list = response.data.slice(0, 20);
    const typeName = type.name || '研究生招生信息网';
    const items = await Promise.all(
        list.map((item) => {
            const itemDate = item.publishDate;
            const itemTitle = item.articleTitle;
            return ctx.cache.tryGet(item.articleUrl, async () => {
                let description = itemTitle;
                try {
                    const result = await got({
                        method: 'get',
                        url: item.articleUrl,
                    });
                    const $ = cheerio.load(result.data);

                    if ($('.blog-inner-text').length > 0) {
                        description = $('.blog-inner-text').html().trim();
                    }
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: item.articleUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `兰州大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `兰州大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
