const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const url = `http://www.acfun.cn/u/${uid}.aspx`;
    const host = 'http://www.acfun.cn';
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: host,
        },
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const title = $('title').text();
    const description = $('.preview').text();
    const list = $('#ac-space-video-list a').get();

    ctx.state.data = {
        title: title,
        link: url,
        description,
        item: list
            .map((item) => {
                const $ = cheerio.load(item);

                const itemTitle = $('p.title').text();
                const itemImg = $('figure img').attr('src');
                const itemUrl = $('a').attr('href');
                const itemDate = $('.date').text();

                return {
                    title: itemTitle,
                    description: `<img src="${itemImg}">`,
                    link: host + itemUrl,
                    pubDate: new Date(itemDate).toUTCString(),
                };
            })
            .reverse(),
    };
};
