const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const tag = ['bluray', '1080p', '720p', '3d', 'webdl'].includes(ctx.params.tag) ? ctx.params.tag : '';

    const { data } = await got({
        method: 'get',
        url: `http://gaoqing.la/${tag}`,
    });

    const $ = cheerio.load(data);
    const list = $('#post_container > li .thumbnail > a');

    let result = list
        .map((_, ele) => {
            const coverImg = $(ele).find('img').attr('src');
            const title = $(ele).attr('title');
            return {
                title,
                link: $(ele).attr('href'),
                description: `
                    <h1>${title}</h1>
                    <img src="${coverImg}" />
                `.trim(),
            };
        })
        .get();
    result = result.slice(0, 10);

    ctx.state.data = {
        title: '中国高清网',
        link: 'http://gaoqing.la',
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
