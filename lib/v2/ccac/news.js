const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')();
    const lang = ctx.params.lang ?? 'sc';
    const type = utils.TYPE[ctx.params.type];

    const BASE = utils.langBase(lang);
    const page = await browser.newPage();
    await page.goto(BASE);
    const articles = await page.evaluate(() => window.articles);

    const list = utils
        .typeFilter(articles, type)
        .slice(0, 11)
        .map((item) => ({
            title: item.name,
            category: item.tags.map((tag) => tag.name).join(','),
            link: utils.BASE_URL + item.url,
            pubDate: parseDate(item.time, 'YYYY-MM-DD'),
        }));
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = cheerio.load(detailResponse.data);
                $('.article_details_body > *').removeAttr('style');
                item.description = $('.article_details_body').html();
                return item;
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
