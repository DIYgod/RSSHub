const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const channelId = ctx.params.channelId;
    const embed = !ctx.params.embed;

    const response = await got({
        method: 'get',
        url: `https://i.youku.com/i/${channelId}/videos`,
        headers: {
            Host: 'i.youku.com',
            Referer: `https://i.youku.com/i/${channelId}`,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.videoitem_pack');

    ctx.state.data = {
        title: $('.username').text(),
        link: `https://i.youku.com/i/${channelId}`,
        description: $('.desc').text(),
        item:
            list &&
            list
                .map((_, item) => {
                    item = $(item);
                    const title = item.find('a.videoitem_videolink').attr('title');
                    const cover = item.find('a.videoitem_videolink > img').attr('src');
                    const $link = item.find('a.videoitem_videolink');
                    const link = $link.length > 0 ? `https:${$link.attr('href')}` : null;
                    const dateText = item.find('p.videoitem_subtitle').text().split('-').length === 2 ? `${new Date().getFullYear()}-${item.find('p.videoitem_subtitle').text()}` : item.find('p.videoitem_subtitle').text();
                    const pubDate = parseDate(dateText);

                    return link
                        ? {
                              title,
                              description: art(path.join(__dirname, 'templates/channel.art'), {
                                  embed,
                                  videoId: path.parse(link).name.replace(/^id_/g, ''),
                                  cover,
                              }),
                              link,
                              pubDate,
                          }
                        : null;
                })
                .get()
                .filter((item) => item),
    };
};
