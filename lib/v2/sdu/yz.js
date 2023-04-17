const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    tzgg: {
        title: '通知公告',
        listSelector: '#div_more_news .leftNews5',
        path: 'tzgg',
    },
    'zszn-ssszs': {
        title: '招生指南-硕士生招生',
        listSelector: '#div_more_news .leftNews',
        path: 'zszn/ssszs',
    },
    fszl: {
        title: '复试专栏',
        listSelector: '#div_more_news .leftNews',
        path: 'fszl',
    },
    'fszl-gsgk': {
        title: '复试公示公开',
        listSelector: '#div_more_news .leftNews',
        path: 'fszl/gsgk',
    },
    'fszl-djxx': {
        title: '复试调剂信息',
        listSelector: '#div_more_news .leftNews',
        path: 'fszl/djxx',
    },
    'zstz-mqhd1': {
        title: '招生拓展-目前活动',
        listSelector: '.layui-col-xs12 li',
        timeSelector: 'span',
        articleSelector: '#vsb_content',
        path: 'zstz/mqhd1',
    },
};

const host = 'https://www.yz.sdu.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/${typeMap[type].path}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = typeMap[type].title || '研究生招生信息网';
    const list = $(typeMap[type].listSelector);
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = typeMap[type].timeSelector ? item.find(typeMap[type].timeSelector).text() : item.parent().next().text().replace('[', '').replace(']', '');
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
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    const articleSelector = typeMap[type].articleSelector || '#vsb_content .v_news_content';
                    if ($(articleSelector).length > 0) {
                        description = $(articleSelector).html().trim();
                    }
                } catch (e) {
                    description = itemTitle;
                }
                const resultData = {
                    title: itemTitle,
                    link: itemUrl,
                    description,
                };
                if (itemDate.length === 10) {
                    resultData.pubDate = timezone(parseDate(itemDate), 8);
                }
                return resultData;
            });
        })
    );
    ctx.state.data = {
        title: `山东大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `山东大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
