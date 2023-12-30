const cheerio = require('cheerio');
const got = require('@/utils/got');
const url = require('url');

const ProcessFeed = (list, cache, link) =>
    Promise.all(
        list
            .filter((item) => {
                // 查询是否具有文章链接，没有则跳过
                const $ = cheerio.load(item);
                if ($('a').length > 0) {
                    return true;
                }
                return false;
            })
            .map(async (item) => {
                let $ = cheerio.load(item);
                const $url = url.resolve(link, $('a').attr('href')); // 原文链接
                const key = $url;
                // 查询是否有未过期缓存
                const value = await cache.get(key);
                if (value) {
                    // 查询返回未过期缓存
                    return JSON.parse(value);
                } else {
                    const response = await got.get($url); // 获取HTML
                    const data = response.data; // 请求返回的HTML
                    $ = cheerio.load(data); // cheerio加载数据

                    // 去除样式
                    $('img, div, span, p, table, td, tr').removeAttr('style');
                    $('style, script').remove();
                    // 还原图片地址
                    $(`${'#vsb_content'} img`).each((i, elem) => {
                        const $elem = $(elem);
                        const src = $elem.attr('src');
                        if (src) {
                            $elem.attr('src', url.resolve(link, src));
                        }
                    });
                    // 还原链接地址
                    $(`${'#vsb_content'} a`).each((i, elem) => {
                        const $elem = $(elem);
                        const src = $elem.attr('href');
                        if (src) {
                            $elem.attr('href', url.resolve(link, src));
                        }
                    });
                    // 还原GIF地址（广航特有）
                    $(`${'#vsb_content'} img`).each((i, elem) => {
                        const $elem = $(elem);
                        const data_ue_src = $elem.attr('data_ue_src');
                        const vurl = $elem.attr('vurl');
                        const orisrc = $elem.attr('orisrc');
                        if (data_ue_src) {
                            $elem.attr('data_ue_src', url.resolve(link, data_ue_src));
                        }
                        if (vurl) {
                            $elem.attr('vurl', url.resolve(link, vurl));
                        }
                        if (orisrc) {
                            $elem.attr('orisrc', url.resolve(link, orisrc));
                        }
                    });

                    const single = {
                        title: $('h2').text(), // 文章标题
                        author: '广州航海学院教务处', // 文章作者
                        link: $url, // 原文链接
                        pubDate: $('div[id=articleInfo]').text().substr(5, 10), // 文章发布时间（学校网站只精确到日）
                        description: $('div .body').html(), // 文章简述（提取文章，剔除无关内容）
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
    ProcessFeed, // 返回修改完成的文章详情HTML
};
