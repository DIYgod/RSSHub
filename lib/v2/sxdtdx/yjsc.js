const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    63: {
        key: '63',
        code: '63',
        name: '硕士生招生',
    },
};

const host = 'http://yjsc.sxdtdx.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/api-ajax_list-1.html`;
    const response = await got({
        method: 'post',
        url: pageUrl,
        headers: {
            Host: 'yjsc.sxdtdx.edu.cn',
            Origin: host,
            Referer: `http://yjsc.sxdtdx.edu.cn/news-list-shuoshishengzhaosheng.html`,
        },
        form: {
            'ajax_type[0]': `${type.code}_news`,
            'ajax_type[1]': '66',
            'ajax_type[2]': type.code,
            'ajax_type[3]': 'news',
            'ajax_type[4]': 'Y-m-d',
            'ajax_type[5]': '45',
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
                    if ($('#editor_content').length > 0) {
                        description = $('#editor_content').html().trim();
                    }
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: item.url,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `山西大同大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `山西大同大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
