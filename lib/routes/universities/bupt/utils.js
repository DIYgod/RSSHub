const cheerio = require('cheerio');
const got = require('@/utils/got');
const url = require('url');

const ProcessFeed = async (list, cache, current, type) =>
    await Promise.all(
        list
            .filter(function (item) {
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
                const response = await got({
                    method: 'get',
                    url: $url,
                });

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

                let title = '';
                if (type === 'sci') {
                    title = $('#timu').text();
                } else {
                    title = $('title').text();
                }
                // 列表上提取到的信息
                return {
                    title: title,
                    description: $(current.selector.content).html(),
                    link: $url,
                    author: '北京邮电大学研究院',
                    guid: $url, // 文章唯一标识
                };
            })
    );

module.exports = {
    ProcessFeed,
};
