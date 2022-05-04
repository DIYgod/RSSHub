const dayjs = require('dayjs');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = {
    fetchMain: async (url, dataElement) => {
        const response = await got({
            method: 'get',
            url,
            https: {
                rejectUnauthorized: false,
            },
        });
        const $ = cheerio.load(response.data);
        // 获取列表
        return {
            list: $(dataElement)
                .map((i, e) => ({
                    href: $(e).children('a').attr('href'),
                    publish_date: $(e).children('span').text(),
                }))
                .get(),
            title: $('title').text(),
        };
    },
    fetchDetail: (list, baseUrl, contentElement, cache) =>
        // 定义输出的item
        Promise.all(
            list.map(async (item) => {
                let { href } = item;
                const { publish_date } = item;
                if (href.indexOf('http') !== 0) {
                    href = baseUrl + href;
                }
                const site_cache = await cache.get(href); // 得到全局中的缓存信息
                // 判断缓存是否存在，如果存在即跳过此次获取的信息

                if (site_cache) {
                    return Promise.resolve(JSON.parse(site_cache));
                }

                // 获取详情页面的介绍
                const detail_response = await got({
                    method: 'get',
                    url: href,
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $ = cheerio.load(detail_response.data);
                const title = $('title').text();
                let detail_content = $(contentElement).html();

                if (!detail_content) {
                    // Unable to extract content
                    // this might be caused by external website referenced
                    // or this is a file
                    detail_content = `无法解析公告, 这可能是因为这是一个外部链接或者文件. 请<a href="${href}">点击查看</a>`;
                }

                // 设置 RSS feed item
                const single = {
                    title,
                    link: href,
                    description: detail_content,
                    pubDate: dayjs(`${publish_date} +0800`, 'YYYY-MM-DD ZZ'),
                };

                // 设置缓存
                cache.set(href, JSON.stringify(single));
                return Promise.resolve(single);
            })
        ),
};
