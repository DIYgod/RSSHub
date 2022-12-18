const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { fixArticleContent } = require('@/utils/wechat-mp');
const baseUrl = 'https://freewechat.com';

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `${baseUrl}/profile/${id}`;
    const { data: response } = await got(url);
    const $ = cheerio.load(response);
    const author = $('h2').text().trim();

    const list = $('.main')
        .toArray()
        .slice(0, -1) // last item is a template
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                author,
                link: `${baseUrl}${item.find('a').attr('href')}`,
                description: item.find('.preview').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    headers: {
                        Referer: url,
                    },
                });
                const $ = cheerio.load(response.data);

                $('.js_img_placeholder').remove();
                $('amp-img').each((_, e) => {
                    e = $(e);
                    e.replaceWith(`<img src="${new URL(e.attr('src'), response.url).href}" width="${e.attr('width')}" height="${e.attr('height')}" decoding="async">`);
                });
                $('amp-video').each((_, e) => {
                    e = $(e);
                    e.replaceWith(`<video width="${e.attr('width')}" height="${e.attr('height')}" controls poster="${e.attr('poster')}">${e.html()}</video>`);
                });

                item.description = fixArticleContent($('#js_content'));
                item.pubDate = timezone(parseDate($('#publish_time').text()), +8);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        image: 'https://freewechat.com/favicon.ico',
        item: items,
    };
};
