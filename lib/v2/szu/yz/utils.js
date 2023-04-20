const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const ProcessFeed = (list, cache, current) =>
    Promise.all(
        list
            .filter((item) => {
                // 如果不包含链接说明不是新闻item，如表头的tr
                const $ = cheerio.load(item, null, false);
                return $('a').length;

                // return typeof ($('a').attr('href')) !== undefined;
                // return false;
            })
            .map((item) => {
                let $ = cheerio.load(item, null, false);
                const $url = new URL($('a').attr('href'), current.url).href;
                return cache.tryGet($url, async () => {
                    // 加载新闻内容页面
                    const response = await got($url);

                    const data = response.data;
                    $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML

                    // 还原图片地址
                    $(`${current.selector.content} img`).each((index, elem) => {
                        const $elem = $(elem);
                        const src = $elem.attr('src');
                        if (src) {
                            $elem.attr('src', new URL(src, current.url).href);
                        }
                    });

                    // 还原链接地址
                    $(`${current.selector.content} a, ul[style]`).each((index, elem) => {
                        const $elem = $(elem);
                        const src = $elem.attr('href');
                        if (src) {
                            $elem.attr('href', new URL(src, current.url).href);
                        }
                    });

                    // 去除样式
                    $('img, div, span, p, table, td, tr, a').removeAttr('style');
                    $('style, script').remove();

                    const title = $('h2').text();

                    const single = {
                        title,
                        description: $(current.selector.content).html() + ($('ul[style]').length ? $('ul[style]').html() : ''),
                        link: $url,
                        pubDate: timezone(
                            parseDate(
                                $('div.ny_fbt')
                                    .text()
                                    .match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[0],
                                'YYYY-MM-DD HH:mm'
                            ),
                            8
                        ), // 混有发表时间和点击量，取出时间
                        author: '深圳大学研究生招生网',
                    };
                    // 返回列表上提取到的信息
                    return single;
                });
            })
    );

module.exports = {
    ProcessFeed,
};
