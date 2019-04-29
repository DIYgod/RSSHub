const cheerio = require('cheerio');
const axios = require('../../../../utils/axios');
const url = require('url');

const ProcessFeed = async (list, cache, current) =>
    await Promise.all(
        list
            .filter(function(item) {
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

                // 加载新闻内容页面
                const response = await axios({
                    method: 'get',
                    url: $url,
                });

                const data = response.data;
                $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML

                // 还原图片地址
                $('img').each((index, elem) => {
                    const $elem = $(elem);
                    const src = $elem.attr('src');
                    if (src && src !== '') {
                        $elem.attr('src', url.resolve(current.url, src));
                    }
                });
                // 还原链接地址
                $('a').each((index, elem) => {
                    const $elem = $(elem);
                    const src = $elem.attr('href');
                    if (src && src !== '') {
                        $elem.attr('href', url.resolve(current.url, src));
                    }
                });
                // 去除样式
                $('img').removeAttr('style');
                $('div').removeAttr('style');
                $('span').removeAttr('style');
                $('p').removeAttr('style');
                $('table').removeAttr('style');
                $('td').removeAttr('style');
                $('tr').removeAttr('style');
                $('style').remove();
                $('script').remove();

                const title = $('h2').text();

                // 列表上提取到的信息
                return {
                    title: title,
                    description: $(current.selector.content).html(),
                    link: $url,
                    // pubDate: $('div.ny_fbt').text().substr(6, 16),
                    pubDate: new Date(
                        $('div.ny_fbt')
                            .text()
                            .substr(6, 16)
                    ).toUTCString(), // 混有发表时间和点击量，取出时间
                    author: '深圳大学研究生招生网',
                    guid: $url, // 文章唯一标识
                };
            })
    );

module.exports = {
    ProcessFeed,
};
