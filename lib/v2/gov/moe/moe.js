const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');

const moeUrl = 'http://www.moe.gov.cn/';
const typesIdMap = [
    { type: 'policy_anal', id: 'tt_con2', name: '政策解读' },
    { type: 'newest_file', id: 'nine_con1', name: '最新文件' },
    { type: 'notice', id: 'nine_con2', name: '公告公示' },
    { type: 'edu_ministry_news', id: 'nine_con3', name: '教育部简报' },
    { type: 'edu_focus_news', id: 'eight_con2 .TRS_Editor', name: '教育要闻' },
];

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let id = '';
    let name = '';

    for (let i = 0; i < typesIdMap.length; i++) {
        if (typesIdMap[i].type === type) {
            id = typesIdMap[i].id;
            name = typesIdMap[i].name;
        }
    }

    if (id === '') {
        logger.error('The given type not found.');
        return;
    }

    const response = await got(moeUrl);

    const $ = cheerio.load(response.data);
    const newsLis = $('div#' + id + '>ul>li');

    ctx.state.data = {
        title: name,
        link: moeUrl,
        item: await Promise.all(
            newsLis
                .map(async (_, item) => {
                    item = $(item);

                    const firstA = item.find('a');
                    const itemUrl = new URL(firstA.attr('href'), moeUrl).href;

                    const infos = await ctx.cache.tryGet(itemUrl, async () => {
                        const res = {};
                        const response = await got(itemUrl);
                        const data = cheerio.load(response.data);

                        if (itemUrl.indexOf('www.gov.cn') > -1) {
                            res.description = data('div.pages_content > p').html();
                            res.title = data('div.article > h1').text();
                        } else if (itemUrl.indexOf('srcsite') > -1) {
                            res.description = data('div#xxgk_content_div').html();
                            res.title = data('div#xxgk_content_redheadbg > h1').text();
                        } else if (itemUrl.indexOf('jyb_') > -1) {
                            res.description = data('div.TRS_Editor').html();
                            res.title = data('div.TRS_Editor').siblings('h1').first().text();
                        }

                        return res;
                    });

                    return {
                        title: infos.title,
                        description: infos.description,
                        link: itemUrl,
                        pubDate: parseDate(item.find('span').text(), 'MM-DD'),
                    };
                })
                .get()
        ),
    };
};
