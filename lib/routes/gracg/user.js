const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = ctx.params.love ? `https://www.gracg.com/${ctx.params.user}/love` : `https://www.gracg.com/${ctx.params.user}`;
    const response = await got({
        method: 'get',
        url: `${url}`,
    });
    const html = response.body;
    const $ = cheerio.load(html);
    const data = $('.TheWorksList').find('li');

    if (data.length === 0) {
        ctx.state.data = {
            title: `${ctx.params.user} 的涂鸦王国作品`,
            link: `https://gracg.com/${ctx.params.user}`,
            description: `${ctx.params.user} 的涂鸦王国作品`,
        };
    } else {
        const name = $('.userbox .username').text();
        const item = await Promise.all(
            data
                .slice(0, 10)
                .map(async (i, el) => {
                    const link = $(el).find('.imgbox a').attr('href');
                    const pics = await ctx.cache.tryGet(link, async () => {
                        const res = await got.get(link);
                        const $1 = cheerio.load(res.body);
                        return $1('.workPage-images img')
                            .map((i, el) => $1(el).attr('src'))
                            .get();
                    });
                    const description = generateItemDesc(pics);
                    return {
                        title: $(el).find('.infobox .titles').text(),
                        description,
                        pubDate: new Date($(el).find('.infobox .time').text()).toUTCString(),
                        link,
                    };
                })
                .get()
        );

        ctx.state.data = {
            title: `${name} 的涂鸦王国作品`,
            link: `https://gracg.com/${ctx.params.user}`,
            description: `${name} 的涂鸦王国作品`,
            item: item,
        };
    }
};

/**
 * 根据图片链接生成 html
 * @param {Array} pics
 * @return {String} itemDesc
 */
function generateItemDesc(pics) {
    const itemDesc = pics.reduce((acc, pic) => {
        acc += `<img src='${pic}><br>`;
        return acc;
    }, '');
    return itemDesc;
}
