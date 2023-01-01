const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.xys.org';
    const currentUrl = `${rootUrl}/new.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'gb2312');

    const $ = cheerio.load(data);

    let items = $('li a')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            item = $(item);
            let link = item.attr('href');
            /^https?:\/\//.test(link) || (link = rootUrl + '/' + link.replace('/^(/)/', ''));
            let date = item.parent().text().trim().slice(0, 8);
            date = parseDate(date, 'YY.MM.DD');
            return {
                title: item.text(),
                link,
                pubDate: date,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const youTube = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)&?/g;
                const matchYoutube = item.link.match(youTube);

                if (matchYoutube) {
                    item.description = `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${item.link.slice(32)}" frameborder="0" allowfullscreen></iframe>`;
                } else {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        responseType: 'buffer',
                    });
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
