const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.xys.org';
    const currentUrl = `${rootUrl}/new.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    // 转码
    const data = iconv.decode(response.data, 'gb2312');

    const $ = cheerio.load(data);

    let items = $('li a')
        .slice(4, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
        .toArray()
        .map((item) => {
            item = $(item);
            let link = item.attr('href');
            /^https?:\/\//.test(link) || (link = rootUrl + '/' + link.replace(/^\//, ''));
            let date = item.parent().text().trim().slice(0, 8);
            date = parseDate(date, 'YY.MM.DD');
            return {
                title: item.text(),
                link,
                pubDate: date,
            };
        });

    items = await Promise.all(
        items
            .filter((item) => !item.link.endsWith('.zip'))
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const youTube = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)&?/g;
                    const matchYoutube = item.link.match(youTube);

                    if (matchYoutube) {
                        item.description = art(path.join(__dirname, 'templates/desc.art'), { youTube: item.link.slice(32) });
                    } else {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                            responseType: 'buffer',
                        });

                        // 转码
                        const detailData = iconv.decode(detailResponse.data, 'gb2312');

                        const content = cheerio.load(detailData);

                        item.description = content.text().replace(/\n/g, '<br>\n');
                    }

                    return item;
                })
            )
    );

    ctx.state.data = {
        title: '新语丝 - 新到资料',
        link: currentUrl,
        item: items,
    };
};
