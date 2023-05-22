const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category ? parseInt(ctx.params.category) : 1;

    const rootUrl = 'http://newzmz.com';
    const rootSUrl = 'http://s.newzmz.com';
    const currentUrl = `${rootUrl}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = [];

    const target = $('div.rowMod').eq(category);

    await Promise.all(
        target
            .find('ul.slides li a')
            .toArray()
            .map((item) => {
                item = $(item);

                return {
                    title: item.text(),
                    link: `${rootSUrl}/view/${item.attr('href').split('/details-').pop()}`,
                };
            })
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    const title = content('.page-header-content').text();

                    items.push(
                        ...content('div.team-con-area')
                            .toArray()
                            .map((a) => {
                                a = content(a);

                                const episode = a
                                    .find('span.up')
                                    .text()
                                    .trim()
                                    .replace(/第 (\d+) /g, '第$1');

                                return {
                                    link: item.link,
                                    guid: `${item.link}#${episode.replace(/\s*/g, '')}`,
                                    title: `${title} ${episode}`,
                                    category: a
                                        .find('div.item-label a')
                                        .toArray()
                                        .map((l) => content(l).text()),
                                    description: art(path.join(__dirname, 'templates/description.art'), {
                                        links: a
                                            .find('ul.team-icons li')
                                            .toArray()
                                            .map((i) => ({
                                                name: content(i).find('p').text(),
                                                link: content(i).find('a').attr('href'),
                                            })),
                                    }),
                                    enclosure_type: 'application/x-bittorrent',
                                    enclosure_url: a.find('a[title="磁力链下载"]').attr('href'),
                                };
                            })
                    );
                })
            )
    );

    ctx.state.data = {
        title: `NEW字幕组 - ${target.find('.row-header-title').text()}`,
        link: currentUrl,
        item: items,
    };
};
