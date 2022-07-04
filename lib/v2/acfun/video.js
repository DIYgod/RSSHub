const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const url = `https://www.acfun.cn/u/${uid}`;
    const host = 'https://www.acfun.cn';
    const response = await got(url, {
        headers: {
            Referer: host,
        },
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const title = $('title').text();
    const description = $('.signature .complete').text();
    const list = $('#ac-space-video-list a').get();
    const image = $('head style')
        .text()
        .match(/.user-photo{\n\s*background:url\((.*)\) 0% 0% \/ 100% no-repeat;/)[1];

    ctx.state.data = {
        title,
        link: url,
        description,
        image,
        item: list.map((item) => {
            item = $(item);

            const itemTitle = item.find('p.title').text();
            const itemImg = item.find('figure img').attr('src');
            const itemUrl = item.attr('href');
            const itemDate = item.find('.date').text();

            return {
                title: itemTitle,
                description: `<img src="${itemImg.split('?')[0]}">`,
                link: host + itemUrl,
                pubDate: parseDate(itemDate, 'YYYY/MM/DD'),
            };
        }),
    };
};
