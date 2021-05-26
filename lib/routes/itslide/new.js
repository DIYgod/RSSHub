const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseUrl = 'https://www.itslide.com';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl + '/new',
        referer: baseUrl,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const posts = $('.mod-post');

    ctx.state.data = {
        link: baseUrl,
        title: 'ITSlide - 专注于PPT幻灯片的分享平台',
        item: posts
            .map((_, item) => {
                const title = $(item).find('a').attr('title');
                const link = baseUrl + '/' + $(item).find('a').attr('href').slice(1);
                const upTime = $(item).find('.mod-post-tip .pr').text();
                const views = $(item).find('.mod-post-tip .pl').text();
                const imgSrc = $(item).find('img').attr('src');

                return {
                    link: link,
                    title: title,
                    description: `描述: ${title}<br>
                        时间：${upTime}<br>
                        浏览：${views}<br>
                        预览：<img src = "${imgSrc}"><br>
                        全文：${link}`,
                    pubDate: $(item).find('.mod-post-tip .pr').text(),
                };
            })
            .get(),
    };
};
