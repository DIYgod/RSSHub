const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const FormData = require('form-data');

// 反爬严格， 无法模拟post formdata
// 其他相关文件及文档均未更改

const typeMap = {
    162: {
        key: '162',
        code: '162',
        name: '新闻动态',
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

const host = 'https://grs.jxufe.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/api-ajax_list-1.html`;
    const formData = new FormData();
    formData.append('ajax_type[]', '162_news');
    formData.append('ajax_type[]', '12');
    formData.append('ajax_type[]', '162');
    formData.append('ajax_type[]', 'news');
    formData.append('ajax_type[]', 'Y-m-d');
    formData.append('ajax_type[]', '30');
    formData.append('ajax_type[]', '15');
    // formData.append('ajax_type', ["is_top DESC", "displayorder DESC", "inputtime DESC"]);
    // formData 添加数组数据
    // formData.append('ajax_type', 'is_top DESC');
    formData.append('ajax_type[7][]', 'is_top DESC');
    formData.append('ajax_type[7][]', 'displayorder DESC');
    formData.append('ajax_type[7][]', 'inputtime DESC');
    formData.append('ajax_type', '');
    formData.append('is_ds', '1');

    const response = await got({
        method: 'post',
        url: pageUrl,
        headers: {
            Host: 'grs.jxufe.edu.cn',
            Origin: host,
            Referer: `Referer: http://grs.jxufe.edu.cn/news-list-xinswenbdongbtaie.html`,
        },
        form: formData,
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
