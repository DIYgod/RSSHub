const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    162: {
        key: '162',
        code: '162',
        name: '新闻动态',
    },
};

const host = 'https://grs.jxufe.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/api-ajax_list-1.html`;
    const response = await got({
        method: 'post',
        url: pageUrl,
        headers: {
            Host: 'grs.jxufe.edu.cn',
            Origin: host,
            Referer: `Referer: http://grs.jxufe.edu.cn/news-list-xinswenbdongbtaie.html`,
        },
        form: {
            'ajax_type[0]': `${type.code}_news`,
            'ajax_type[1]': '12',
            'ajax_type[2]': type.code,
            'ajax_type[3]': 'news',
            'ajax_type[4]': 'Y-m-d',
            'ajax_type[5]': '30',
            'ajax_type[6]': '15',
            'ajax_type[7][0]': 'is_top DESC',
            'ajax_type[7][1]': 'displayorder DESC',
            'ajax_type[7][2]': 'inputtime DESC',
            'ajax_type[8]': '',
            is_ds: '1',
        },
    });
    const list = response.data.data;
    const typeName = type.name || '研究生招生信息网';
    const items = await Promise.all(
        list.map((item) => {
            const itemDate = item.updatetime;
            const itemTitle = item.title;
            return ctx.cache.tryGet(item.url, async () => {
                let description = itemTitle;
                try {
                    const result = await got({
                        method: 'get',
                        url: item.url,
                    });
                    const $ = cheerio.load(result.data);

                    if ($('.showmain').length > 0) {
                        description = $('.showmain').html().trim();
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
        title: `江西财经大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `江西财经大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
