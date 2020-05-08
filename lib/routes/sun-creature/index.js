const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://suncreature.com`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('li.t');

    ctx.state.data = {
        title: 'Sun Creature',
        link: url,
        item: list
            .map((index, item) => {
                item = $(item);
                const title = `${item.find('h2').first().text()}`;
                const itemWebmUrl = `https://suncreature.com/videos/${item.find(':nth-child(1)').attr('data-loop')}.webm`;
                const itemWebmShow = `<video controls="controls" width="100%" src="${itemWebmUrl}"></video><br>`;

                const vimeoID = `${item.find('button').attr('data-vimeo')}`;
                const isvimeo = vimeoID > 0;

                const ItemURL = `${item.find('a').attr('href')}`;
                const Link = `<a href="${ItemURL}">${ItemURL}</a>`;

                const description = isvimeo ? `<iframe width="640" height="360" src='https://player.vimeo.com/video/${vimeoID}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>` : `${Link}`;

                return {
                    title: title,
                    description: `${itemWebmShow}` + description,
                };
            })
            .get(),
    };
};
