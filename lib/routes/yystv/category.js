const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `http://www.yystv.cn/b/${category}`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const first_part = $('.b-list-main-item')
        .slice(0, 2)
        .map(function () {
            const info = {
                title: $(this).find('.b-main-info-title').text(),
                link: 'http://www.yystv.cn' + $(this).find('.b-main-info-title a').attr('href'),
                pubDate: date($(this).find('.b-main-createtime').text()),
                author: $(this).find('.b-author').text(),
            };
            return info;
        })
        .get();

    const second_part = $('.list-container li')
        .slice(0, 18)
        .map(function () {
            const info = {
                title: $('.list-article-title', this).text(),
                link: 'http://www.yystv.cn' + $('a', this).attr('href'),
                pubDate: date($('.c-999', this).text()),
                author: $('.handler-author-link', this).text(),
            };
            return info;
        })
        .get();

    const items = first_part.concat(second_part);
    function getDescription(items) {
        return Promise.all(
            items.map(async (currentValue) => {
                currentValue.description = await ctx.cache.tryGet(currentValue.link, async () => {
                    const r = await got({
                        url: currentValue.link,
                        method: 'get',
                    });
                    const $ = cheerio.load(r.data);
                    return $('.doc-content div').html();
                });
                return currentValue;
            })
        );
    }
    await getDescription(items).then(() => {
        ctx.state.data = {
            title: '游研社-' + $('title').text(),
            link: `http://www.yystv.cn/b/${category}`,
            item: items,
        };
    });
};
