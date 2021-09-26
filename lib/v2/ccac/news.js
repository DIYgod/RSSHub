const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const TYPE = {
    case: '案件發佈',
    Persuasion: '調查報告或勸喻',
    AnnualReport: '年度報告',
    PCANews: '公署消息',
};

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')();
    const lang = ctx.params.lang || 'sc';
    const type = TYPE[ctx.params.type];

    const BASE = utils.langBase(lang);
    const page = await browser.newPage();
    await page.goto(BASE);
    const articles = await page.evaluate(() => window.articles);
    const list = articles
        .filter((item) => item.tags.some((tag) => tag.name === TYPE[ctx.params.type]))
        .slice(0, 11)
        .map((item) => ({
            title: item.name,
            category: item.tags.join(','),
            link: utils.BASE_URL + item.url,
            pubDate: parseDate(item.time, 'YYYY-DD-MM'),
        }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = cheerio.load(detailResponse.data);
                item.description = $('.article_details_body').html();
            })
        )
    );

    ctx.state.data = {
        title: `CCAC ${type}`,
        link: BASE,
        description: `CCAC ${type}`,
        language: ctx.params.lang ? utils.LANG_TYPE[ctx.params.lang] : utils.LANG_TYPE.sc,
        item: items,
    };
};
