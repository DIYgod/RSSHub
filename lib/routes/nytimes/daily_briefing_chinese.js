const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'https://www.nytimes.com/zh-hans/series/daily-briefing-chinese';
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const post = $('.css-13mho3u .css-ye6x8s')
        .map((index, elem) => {
            const $item = $(elem);
            const $link = $item.find('a');
            const $title = $item.find('h2');

            return {
                title: $title.text(),
                link: 'https://www.nytimes.com' + $link.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        post.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const data = response.data;
                const arr = data.match(/"url":"https:\\u002F\\u002Fstatic(\S*)"articleLarge"/g);
                const imageLink = arr.map((e) => JSON.parse(`{${e}}`).url);

                const $ = cheerio.load(data);
                $('.css-pncxxs.etfikam0').remove();
                // remove 'Credit...'
                $('.css-1ly73wi.e1tej78p0').remove();
                $('.css-1xdhyk6.erfvjey0').each((i, e) => $(e).replaceWith(`<img src="${imageLink[i]}">`));

                $('.css-1l44abu.ewdxa0s0').each((i, e) => {
                    const figureNote = $(e)
                        .children()
                        .map((i, e) => $(e).text())
                        .get();
                    $(e).replaceWith(`<p><small>${figureNote.join(' ')}</small><p>`);
                });
                const date = $('time').attr('datetime');

                item.description = $('.meteredContent.css-1r7ky0e').html();
                item.pubDate = parseDate(date);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '纽约时报中文网|新闻简报',
        link: url,
        item: items,
    };
};
