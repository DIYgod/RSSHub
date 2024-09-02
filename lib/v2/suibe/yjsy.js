const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    zsxx: {
        key: 'zsxx',
        name: '招生信息',
    },
    '3123kdgg': {
        key: '3123kdgg',
        name: '3123考点公告',
    },
    7493: {
        key: '7493',
        name: '招生政策',
    },
    7494: {
        key: '7494',
        name: '招生简章、拟招生人数等信息',
    },
    7495: {
        key: '7495',
        name: '复试信息',
    },
    7496: {
        key: '7496',
        name: '录取信息',
    },
    7497: {
        key: '7497',
        name: '招生咨询及申诉渠道',
    },
    19776: {
        key: '19776',
        name: '招生工作',
    },
};

const host = 'https://www.suibe.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    let typeName = '';
    let list = [];
    let pageUrl = '';
    let $ = null;
    if (type === 'all') {
        const $_list = await Promise.all(
            Object.keys(typeMap).map(async (item) => {
                pageUrl = `${host}/yjsy/${item}/list.htm`;
                const response = await got(pageUrl);
                const $ = cheerio.load(response.data);
                typeName = '全部研招信息';
                const $list = $('.news_list li.news').slice(0, 5);
                return $list.toArray().map((item) => $(item));
            })
        );
        for (let i = 0; i < $_list.length; i++) {
            list.push(...$_list[i]);
        }
    } else {
        type = typeMap[type].key;
        pageUrl = `${host}/yjsy/${type}/list.htm`;
        const response = await got(pageUrl);
        $ = cheerio.load(response.data);
        typeName = $('.column-title').text() || '研究生招生信息网';
        const $list = $('.news_list li.news').toArray();
        list = $list.map((item) => $(item));
    }
    const items = await Promise.all(
        Array.from(list).map((item) => {
            const itemDate = item.find('.news_metalistcolumn').text().slice(-10);
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
                    if ($('.article').length > 0) {
                        description = $('.article').html().trim();
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
        title: `上海对外经贸大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `上海对外经贸大学研究生院 - ${typeName}`,
        item: items,
    };
};
