const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

// 云南大学教务处主要通知
module.exports = async (ctx) => {
    const host = 'http://www.jwc.ynu.edu.cn/';
    const category = ctx.params.category;
    const dep = ['教务科', '学籍科', '教学研究科', '实践教学科'];

    const response = await got({
        method: 'get',
        url: 'http://www.jwc.ynu.edu.cn/',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const firstRow = category < 3 ? 0 : 1;
    const secondRow = category % 2 === 0 ? 2 : 1;

    const list = $('.index-row3')
        .eq(firstRow)
        .find('.c' + secondRow + ' .text-list ul li')
        .slice(0, 8)
        .map((i, e) => ({
            path: $('a', e).attr('href'),
            title: $('a', e).attr('title'),
            author: dep[category - 1],
        }))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const { path, title, author } = item;
            const link = path.indexOf('http://') === -1 ? host + path : path;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
                headers: {
                    Referer: host,
                },
            });

            const $ = cheerio.load(response.data);
            let description =
                $('.v_news_content').html() &&
                $('.v_news_content')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                    .trim();
            if ($('#vsb_content').siblings().has('ul li').length > 0) {
                const attachment = $('#vsb_content')
                    .siblings('ul')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                    .trim();
                description = description.concat('\n' + attachment);
            }
            const single = {
                pubDate: new Date($('.taitshj').text().slice(5, 15)).toUTCString(),
                author: author,
                link: link,
                title: title,
                description: description,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '云南大学教务处' + dep[category - 1] + '通知',
        link: host,
        description: '云南大学教务处' + dep[category - 1],
        item: out,
    };
};
