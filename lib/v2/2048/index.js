const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '2';

    const rootUrl = 'https://hjd2048.com';
    const currentUrl = `${rootUrl}/2048/thread.php?fid-${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const currentHost = `https://${new URL(response.url).host}`; // redirected host

    $('#shortcut').remove();
    $('tr[onmouseover="this.className=\'tr3 t_two\'"]').remove();

    const list = $('#ajaxtable tbody .tr2')
        .last()
        .nextAll('.tr3')
        .toArray()
        .map((item) => {
            item = $(item).find('.subject');

            return {
                title: item.text(),
                link: `${currentHost}/2048/${item.attr('href')}`,
                guid: `${rootUrl}/2048/${item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.guid, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('.ads, .tips').remove();

                content('ignore_js_op').each(function () {
                    content(this).replaceWith(`<img src="${content(this).find('img').attr('src')}">`);
                });

                item.author = content('.fl.black').text();
                item.pubDate = timezone(
                    parseDate(
                        content('.fl.gray')
                            .text()
                            .replace(/发表于: /, '')
                    ),
                    +8
                );

                const downloadLink = content('#read_tpc').first().find('a').last();

                if (downloadLink.text().indexOf('elsbbus.com') > -1) {
                    const torrentResponse = await got({
                        method: 'get',
                        url: downloadLink.text(),
                    });

                    const torrent = cheerio.load(torrentResponse.data);

                    item.enclosure_type = 'application/x-bittorrent';
                    item.enclosure_url = `https://data.elsbbus.com/${torrent('.uk-button').last().attr('href')}`;

                    const magnet = torrent('.uk-button').first().attr('href');

                    downloadLink.replaceWith(
                        art(path.join(__dirname, 'templates/download.art'), {
                            magnet,
                            torrent: item.enclosure_url,
                        })
                    );
                }

                item.description = content('#read_tpc').first().html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('#main #breadCrumb a').last().text()} - 2048核基地`,
        link: currentUrl,
        item: items,
    };
};
