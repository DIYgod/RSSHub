import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:what?/:id?/:needTorrents?/:needImages?',
    name: 'Unknown',
    maintainers: [],
    features: {
        nsfw: true,
    },
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';
    const what = ctx.req.param('what') ?? '';
    const needTorrents = /t|y/i.test(ctx.req.param('needTorrents') ?? 'true');
    const needImages = /t|y/i.test(ctx.req.param('needImages') ?? 'true');

    const rootUrl = 'https://e-hentai.org';
    const currentUrl = `${rootUrl}/${id ? (what === 'search' ? `?${id}` : what === 'category' ? id : `${what}/${id}`) : what}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.itd').parent().remove();

    let items = $('table.gltc tbody tr')
        .slice(1, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) + 1 : needImages ? 16 : 26)
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
                    torrents = await cache.get(item.enclosure_url);

                if (!torrents) {
                    const torrentResponse = await got({
                        method: 'get',
                        url: item.enclosure_url,
                    });

                    const torrent = load(torrentResponse.data);

                    torrent('h1, input[name="torrent_info"]').remove();
                    forms = torrent('form').parent().html();

                    torrents = torrent('table tbody tr td a')
                        .toArray()
                        .map((t) => {
                            t = torrent(t);
                            return { link: t.attr('href'), title: t.text() };
                        });
                    cache.set(item.enclosure_url, torrents);
                }
                item.description += forms;
                item.enclosure_url = torrents[0].link;
                item.enclosure_type = 'application/x-bittorrent';
            }

            if (needImages) {
                let images = await cache.get(item.link);

                if (!images) {
                    const imageResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(imageResponse.data);

                    images = await Promise.all(
                        content('.gdtm a')
                            .toArray()
                            .map((i) =>
                                cache.tryGet(content(i).attr('href'), async () => {
                                    const imageResponse = await got({
                                        method: 'get',
                                        url: content(i).attr('href'),
                                    });

                                    const image = load(imageResponse.data);

                                    return image('#img').attr('src');
                                })
                            )
                    );
                    cache.set(item.link, images);
                }
                item.description += art(path.join(__dirname, 'templates/images.art'), { images });
            }
            return item;
        })
    );

    return {
        title: `${id || what || 'Front Page'} - E-Hentai Galleries`,
        link: currentUrl,
        item: items,
    };
}
