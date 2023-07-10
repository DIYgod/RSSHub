const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const host = 'https://gcxy.cug.edu.cn';

    const typeUrl = [
        {
            name: '所有',
            url: '',
        },
        {
            name: '学院新闻',
            url: '/index/xyxw.htm',
        },
        {
            name: '通知公告',
            url: '/index/tzgg.htm',
        },
        {
            name: '党建新闻',
            url: '/index/djxw.htm',
        },
        {
            name: '学术动态',
            url: '/kxyj/xsdt.htm',
        },
        {
            name: '本科生培养',
            url: '/index/bkspy.htm',
        },
        {
            name: '研究生教育',
            url: '/index/yjsjy.htm',
        },
    ];

    let type = ctx.params && ctx.params.type;
    // check if the type is valid(is number and within range from 0 to typeUrl.length), if not, set it to 0
    if (type === undefined || isNaN(type) || Number(type) < 0 || Number(type) > 6) {
        type = 0;
    }
    else {
        type = parseInt(type);
    }

    let typeList = [];

    if (type === 0) {
        // 获取所有的
        typeList = typeUrl.slice(1);
    } else {
        typeList = [typeUrl[type]];
    }

    const getItems = async function (url) {
        try {
            const response = await got.get(host + url, {
                headers: {
                    Referer: host,
                }
            });
            const $ = cheerio.load(response.data);
            const rowList = $('ul.col-news-list > li.list_item');
            // get all items from the rowList
            const items = rowList
                .map((index, item) => {
                    const li = $(item);
                    return {
                        title: li.find('a.news-title').text(),
                        link: new URL(li.find('a.news-title').attr('href'), host).href,
                        description: '',
                        pubDate: new Date(li.find('span.news-date').text()).toUTCString(),
                    };
                })
                .get();

            return Promise.all(
                items.map((element) =>
                    ctx.cache.tryGet(`cug/${element.link}`, async () => {
                        try {
                            const result = await got.get(String(element.link));
                            const $ = cheerio.load(result.data);
                            element.description = $('.v_news_content').html();
                        } catch (e) {
                            logger.warn(`cug/gcxy: ${element.link} -- ${e.message}`);
                        }
                        return element;
                    })
                )
            );
        } catch (e) {
            return [];
        }
    };

    const outList = await Promise.all(typeList.map((t) => getItems(t.url)));

    ctx.state.data = {
        title: '[' + typeUrl[type].name + ']' + 'CUG-工程学院',
        link: host + typeUrl[type].url,
        description: '中国地质大学(武汉)工程学院-' + typeUrl[type].name,
        item: outList.reduce((p, n) => p.concat(n)),
    };
};
