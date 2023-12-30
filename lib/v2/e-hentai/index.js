const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';
    const what = ctx.params.what ?? '';
    const needTorrents = /t|y/i.test(ctx.params.needTorrents ?? 'true');
    const needImages = /t|y/i.test(ctx.params.needImages ?? 'true');

    const rootUrl = 'https://e-hentai.org';
    const currentUrl = `${rootUrl}/${id ? (what === 'search' ? `?${id}` : what === 'category' ? id : `${what}/${id}`) : what}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.itd').parent().remove();

    let items = $('table.gltc tbody tr')
        .slice(1, ctx.query.limit ? parseInt(ctx.query.limit) + 1 : needImages ? 16 : 26)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('div.glink').text(),
                author: item.find('td.glhide div a').text(),
                link: item.find('td.glname a').attr('href'),
                pubDate: parseDate(item.find('div.ir').prev().text()),
                category: item
                    .find('div.gt')
                    .toArray()
                    .map((tag) => $(tag).attr('title').replace(/^:/, '')),
                description: needImages ? '' : `<img src="${item.find('div.glthumb div img').attr('data-src') ?? item.find('div.glthumb div img').attr('src')}">`,
                enclosure_url: needTorrents ? (item.find('div.gldown a img[title="Show torrents"]').length > 0 ? item.find('.gldown a').attr('href') : undefined) : undefined,
            };
        });

    items = await Promise.all(
        items.map(async (item) => {
            if (item.enclosure_url) {
                let forms = '',
                    torrents = await ctx.cache.get(item.enclosure_url);

                if (!torrents) {
                    const torrentResponse = await got({
                        method: 'get',
                        url: item.enclosure_url,
                    });

                    const torrent = cheerio.load(torrentResponse.data);

                    torrent('h1, input[name="torrent_info"]').remove();
                    forms = torrent('form').parent().html();

                    torrents = torrent('table tbody tr td a')
                        .toArray()
                        .map((t) => {
                            t = torrent(t);
                            return { link: t.attr('href'), title: t.text() };
                        });
                    ctx.cache.set(item.enclosure_url, torrents);
                }
                item.description += forms;
                item.enclosure_url = torrents[0].link;
                item.enclosure_type = 'application/x-bittorrent';
            }

            if (needImages) {
                let images = await ctx.cache.get(item.link);

                if (!images) {
                    const imageResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(imageResponse.data);

                    images = await Promise.all(
                        content('.gdtm a')
                            .toArray()
                            .map((i) =>
                                ctx.cache.tryGet(content(i).attr('href'), async () => {
                                    const imageResponse = await got({
                                        method: 'get',
                                        url: content(i).attr('href'),
                                    });

                                    const image = cheerio.load(imageResponse.data);

                                    return image('#img').attr('src');
                                })
                            )
                    );
                    ctx.cache.set(item.link, images);
                }
                item.description += art(path.join(__dirname, 'templates/images.art'), { images });
            }
            return item;
        })
    );

    ctx.state.data = {
        title: `${id || what || 'Front Page'} - E-Hentai Galleries`,
        link: currentUrl,
        item: items,
    };
};
