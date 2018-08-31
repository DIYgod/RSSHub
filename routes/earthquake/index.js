const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const Datetime = require('luxon').DateTime;

module.exports = async (ctx) => {
    const link = 'http://www.cea.gov.cn/publish/dizhenj/464/479/index.html';
    const html = (await axios.get(link)).data;
    const $ = cheerio.load(html);
    const $items = $('.list_main_right_conbg_con li');
    const items = await Promise.all(
        $items.toArray().map(async (el) => {
            const $el = $(el);
            const url = 'http://www.cea.gov.cn' + $el.find('a').attr('href');
            let html = await ctx.cache.get(url);
            if (!html) {
                html = (await axios.get(url)).data;
                ctx.cache.set(url, html, 3 * 24 * 60 * 60);
            }
            const $1 = cheerio.load(html);
            const $content = $1('.detail_main_right_conbg_con > div');
            const $container = $('<div>');

            $content
                .find('img')
                .each((i, el) => {
                    const $el = $(el);
                    const src = $el.attr('src');
                    $el.attr('src', 'http://www.cea.gov.cn' + src);
                    $el.attr('width', '');
                })
                .appendTo($('<p>'))
                .parent()
                .appendTo($container);

            const $scriptEls = $content.find('script');
            const info = [
                $($scriptEls[0])
                    .html()
                    .match(/origTime\("(.+分)/)[1],
                $($scriptEls[1])
                    .html()
                    .match(/"(.+)"/)[1] + ', ',
                $($scriptEls[2])
                    .html()
                    .match(/"(.+)"/)[1],
                $($scriptEls[3])
                    .html()
                    .match(/"(.+)"/)[1],
            ];

            const text = info.reduce(
                (text, field) => text.replace(/<script>[\s\S]+?<\/script>/, field),
                $content
                    .children()
                    .not('center')
                    .parent()
                    .html()
            );
            $container.prepend(`<p>${text}</p>`);

            const dateString = $1('.detail_main_right_conbg_tit')
                .children()
                .last()
                .text()
                .trim()
                .substring(5);

            return {
                title: $el.find('a').text(),
                link: url,
                pubDate: Datetime.fromFormat(dateString, 'yyyy-LL-dd HH:mm:ss').toRFC2822(),
                description: $container.html(),
            };
        })
    );

    ctx.state.data = {
        title: '中国地震局震情速递',
        link,
        item: items,
    };
};
