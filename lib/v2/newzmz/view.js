const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = `https://s.newzmz.com`;
    const currentUrl = `${rootUrl}/view/${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('div.team-con-area')
        .toArray()
        .map((item) => {
            item = $(item);

            const episode = item
                .find('span.up')
                .text()
                .trim()
                .replace(/第 (\d+) /g, '第$1');

            return {
                link: currentUrl,
                guid: `${currentUrl}#${episode.replace(/\s*/g, '')}`,
                title: episode,
                category: item
                    .find('div.item-label a')
                    .toArray()
                    .map((l) => $(l).text()),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    links: item
                        .find('ul.team-icons li')
                        .toArray()
                        .map((i) => ({
                            name: $(i).find('p').text(),
                            link: $(i).find('a').attr('href'),
                        })),
                }),
                enclosure_type: 'application/x-bittorrent',
                enclosure_url: item.find('a[title="磁力链下载"]').attr('href'),
            };
        });

    ctx.state.data = {
        title: `NEW字幕组 - ${$('.page-header-content').text()}`,
        link: currentUrl,
        item: items,
    };
};
