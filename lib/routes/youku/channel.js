const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');

module.exports = async (ctx) => {
    const channelId = ctx.params.channelId;
    const embed = !ctx.params.embed;

    const response = await got({
        method: 'get',
        url: `http://i.youku.com/i/${channelId}/videos`,
        headers: {
            Host: 'i.youku.com',
            Referer: `http://i.youku.com/i/${channelId}`,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.items > .v');

    ctx.state.data = {
        title: $('.username').text(),
        link: `http://i.youku.com/i/${channelId}`,
        description: $('.desc').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const cover = item.find('.v-thumb img').attr('src');
                    const title = item.find('.v-link a').attr('title');
                    const $link = item.find('.v-meta-title > a');
                    const link = $link.length > 0 ? `https:${$link.attr('href')}` : null;

                    if (link) {
                        const videoId = path.parse(link).name.replace(/^id_/g, '');
                        const iframe = `<iframe height=498 width=510 src='https://player.youku.com/embed/${videoId}' frameborder=0 'allowfullscreen'></iframe>`;

                        return {
                            title,
                            description: `
                ${embed ? iframe : ''}
                <br>
                <img src="${cover}">
              `,
                            link,
                        };
                    } else {
                        return null;
                    }
                })
                .get()
                .filter((item) => item),
    };
};
