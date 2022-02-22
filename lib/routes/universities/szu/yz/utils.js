const cheerio = require('cheerio');
const got = require('@/utils/got');
const url = require('url');

const ProcessFeed = (list, cache, current) =>
    Promise.all(
        list
            .filter((item) => {
                // 如果不包含链接说明不是新闻item，如表头的tr
                const $ = cheerio.load(item);
                if ($('a').length > 0) {
                    return true;
                }
                return false;

                // return typeof ($('a').attr('href')) !== undefined;
                // return false;
            })
            .map(async (item) => {
                let $ = cheerio.load(item);
                const $url = url.resolve(current.url, $('a').attr('href'));
                const key = $url;
                // 检查缓存中是否存在该页面

                const value = await cache.get(key);
                if (value) {
                    // 查询返回未过期缓存
                    return JSON.parse(value);
                } else {
                    // 加载新闻内容页面
                    const response = await got.get($url);

                    const data = response.data;
                    $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML

                    // 还原图片地址
                    $(`${current.selector.content} img`).each((index, elem) => {
                        const $elem = $(elem);
                        const src = $elem.attr('src');
                        if (src) {
                            $elem.attr('src', url.resolve(current.url, src));
                        }
                    });

                    // 还原链接地址
                    $(`${current.selector.content} a`).each((index, elem) => {
                        const $elem = $(elem);
                        const src = $elem.attr('href');
                        if (src) {
                            $elem.attr('href', url.resolve(current.url, src));
                        }
                    });

                    // 去除样式
                    $('img, div, span, p, table, td, tr').removeAttr('style');
                    $('style, script').remove();

                    const title = $('h2').text();

                    const single = {
                        title,
                        description: $(current.selector.content).html(),
                        link: $url,
                        pubDate: new Date($('div.ny_fbt').text().substr(6, 16)).toUTCString(), // 混有发表时间和点击量，取出时间
                        author: '深圳大学研究生招生网',
                        guid: $url, // 文章唯一标识
                    };
                    // 将内容写入缓存
                    cache.set(key, JSON.stringify(single)); // 缓存时间为24h
                    // 返回列表上提取到的信息
                    return single;
                }
            })
    );

module.exports = {
    ProcessFeed,
};
