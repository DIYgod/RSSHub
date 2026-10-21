import path from 'node:path';

import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem } from '@/types';
import got from '@/utils/got';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface RequestHeaders {
    cookie?: string;
}

interface TorrentState {
    token?: string;
}

const headers: RequestHeaders = {};
const hasCookie = config.ehentai.ipb_member_id && config.ehentai.ipb_pass_hash && config.ehentai.sk;
const fromEx = hasCookie && config.ehentai.igneous;
if (hasCookie) {
    if (fromEx) {
        const { ipb_member_id: memberId, ipb_pass_hash: passHash, sk, igneous } = config.ehentai;
        headers.cookie = `ipb_member_id=${memberId};ipb_pass_hash=${passHash};sk=${sk};igneous=${igneous}`;
    } else {
        const { ipb_member_id: memberId, ipb_pass_hash: passHash, sk } = config.ehentai;
        headers.cookie = `ipb_member_id=${memberId};ipb_pass_hash=${passHash};sk=${sk}`;
    }
}

if (config.ehentai.star) {
    headers.cookie = `${headers.cookie};star=${config.ehentai.star}`;
}

function ehgot(url) {
    return fromEx ? got({ method: 'get', url: `https://exhentai.org/${url}`, headers }) : got({ method: 'get', url: `https://e-hentai.org/${url}`, headers });
}

function getThumbnail(cache, thumbnailUrl) {
    return cache.tryGet(`ehentai:thumbnail:${thumbnailUrl}`, async () => {
        try {
            const buffer = await ofetch.raw<ArrayBuffer, 'arrayBuffer'>(thumbnailUrl, { responseType: 'arrayBuffer', headers: headers.cookie ? { Cookie: headers.cookie } : undefined });
            const data = Buffer.from(buffer._data!).toString('base64');
            const ext = path.extname(new URL(thumbnailUrl).pathname).slice(1).toLowerCase();
            const imageTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml' };
            const contentType = buffer.headers.get('content-type')?.split(';', 1)[0].toLowerCase();
            if (contentType && !contentType.startsWith('image/')) {
                return thumbnailUrl;
            }
            const mimeType = contentType === 'image/jpg' ? 'image/jpeg' : contentType?.startsWith('image/') ? contentType : imageTypes[ext];
            if (!mimeType) {
                return thumbnailUrl;
            }
            return `data:${mimeType};base64,${data}`;
        } catch (error) {
            logger.warn('Cannot download thumbnail: ' + thumbnailUrl, error);
            return thumbnailUrl;
        }
    });
}

function parseElement($, element, layout: string, includeBittorrent: string | boolean) {
    const el = $(element);
    const title = el.find('.glink').html();
    const rawDate = el.find('div[id^="posted_"]').text();
    const pubDate = rawDate ? timezone(parseDate(rawDate), 0) : undefined;
    let linkElement;
    let imageElement;
    // match layout
    if ('mpl'.includes(layout)) {
        // Minimal, Minimal+, Compact
        linkElement = el.find('td[class^="gl3"] a');
        imageElement = el.find('td[class^=gl2] div.glthumb div img');
    } else if (layout === 'e') {
        // Extended
        linkElement = el.find('td[class^="gl1"] a');
        imageElement = linkElement.find('img');
    } else if (layout === 't') {
        // Thumbnail
        linkElement = el.find('div[class^="gl3t"] a');
        imageElement = linkElement.find('img');
    }
    const link = linkElement.attr('href');
    let thumbnail = imageElement.data('src') ?? imageElement.attr('src');
    if (config.ehentai.img_proxy && thumbnail) {
        const url = new URL(thumbnail);
        thumbnail = config.ehentai.img_proxy + url.pathname + url.search;
    }
    const description = thumbnail ? `<img src='${thumbnail}' alt='thumbnail'>` : undefined;
    if (!title || !link) {
        return;
    }

    const item: DataItem & { bittorrentPageUrl?: string; thumbnail?: string } = {
        thumbnail,
        title,
        description,
        pubDate,
        link,
    };
    if (includeBittorrent) {
        const downloadElement = el.find('div.gldown');
        const bittorrentPageUrl = downloadElement.find('a').attr('href');
        if (bittorrentPageUrl) {
            item.bittorrentPageUrl = bittorrentPageUrl;
        }
    }
    if ('le'.includes(layout)) {
        // artist tags will only show in Compact or Extended layout
        // get artist names as author
        item.author = $(el)
            .find('div.gt[title^="artist:"]')
            .toArray()
            .map((tag) => $(tag).text())
            .join(' / ');
    }
    return item;
}

async function parsePage(cache, data, includeBittorrent: string | boolean, embedThumbnail: string | boolean, ctx: Context, torrentState: TorrentState) {
    const $ = load(data);
    // "m" for Minimal
    // "p" for Minimal+
    // "l" for Compact
    // "e" for Extended
    // "t" for Thumbnail
    let layout = 't';

    // "itg gld" for Thumbnail
    let galleries = $('div[class^="itg gld"]');
    // "itg gltm" for Minimal or Minimal+
    if (galleries.length <= 0) {
        galleries = $('table[class^="itg gltm"] tbody');
        layout = 'm';
    }
    // "itg gltc" for Compact
    if (galleries.length <= 0) {
        galleries = $('table[class^="itg gltc"] tbody');
        layout = 'l';
    }
    // "itg glte" for Extended
    if (galleries.length <= 0) {
        galleries = $('table[class^="itg glte"] tbody');
        layout = 'e';
    }
    if (galleries.length <= 0) {
        return [];
    }

    const items = galleries
        .children()
        .toArray()
        .map((element) => parseElement($, element, layout, includeBittorrent))
        .filter((item) => item !== undefined);
    return await pMap(
        items,
        async (item) => {
            if (embedThumbnail && item.thumbnail) {
                const thumbnail = await getThumbnail(cache, item.thumbnail);
                item.description = `<img src='${thumbnail}' alt='thumbnail'>`;
            }
            if (includeBittorrent && item.bittorrentPageUrl) {
                const bittorrentUrl = await getBittorrent(cache, item.bittorrentPageUrl, torrentState);
                if (bittorrentUrl) {
                    item.enclosure_url = bittorrentUrl;
                    item.enclosure_type = 'application/x-bittorrent';
                }
            }
            return item;
        },
        { concurrency: 3 }
    );
}

function getBittorrent(cache, bittorrentPageUrl, torrentState: TorrentState) {
    return cache.tryGet(bittorrentPageUrl, async () => {
        try {
            const response = await got({ method: 'get', url: bittorrentPageUrl, headers });
            const $ = load(response.data);
            const forms = $('form').toArray();
            let bittorrentUrl;
            for (const formElement of forms) {
                const linkElement = $(formElement).find('a');
                const onclick = linkElement.attr('onclick');
                if (!onclick) {
                    continue;
                }
                const match = onclick.match(/'(.*?)'/);
                if (!match) {
                    continue;
                }
                bittorrentUrl = match[1];
                const tokenMatch = bittorrentUrl.match(/torrent\?p=(.*)$/);
                if (tokenMatch) {
                    torrentState.token = tokenMatch[1];
                }
            }
            return bittorrentUrl;
        } catch {
            return;
        }
    });
}

async function updateBittorrentUrl(cache, items, torrentState: TorrentState) {
    // Refresh cached torrent passwords only when this request obtained a new one.
    if (torrentState.token) {
        await Promise.all(
            items.map((item) => {
                if (!item.enclosure_url) {
                    return;
                }
                item.enclosure_url = item.enclosure_url.replace(/torrent\?p=.*$/, () => `torrent?p=${torrentState.token}`);
                return cache.set(item.bittorrentPageUrl, item.enclosure_url);
            })
        );
    }
    return items;
}

async function gatherItemsByPage(cache, url, includeBittorrent: string | boolean, embedThumbnail: string | boolean, ctx: Context) {
    const response = await ehgot(url);
    const torrentState: TorrentState = {};
    const items = await parsePage(cache, response.data, includeBittorrent, embedThumbnail, ctx, torrentState);
    return (await updateBittorrentUrl(cache, items, torrentState)).map((item) => {
        delete item.thumbnail;
        delete item.bittorrentPageUrl;
        return item;
    });
}

function checkFirstPage(page?: string) {
    if (page !== undefined && page !== '0') {
        throw new InvalidParameterError('Only the latest first page is supported. Omit the page parameter or use 0.');
    }
}

function getFavoritesItems(cache, favcat, inlineSet, page, getBittorrent: string | boolean = false, embedThumb: string | boolean = false, ctx: Context) {
    checkFirstPage(page);
    return gatherItemsByPage(cache, `favorites.php?favcat=${favcat}&inline_set=${inlineSet}`, getBittorrent, embedThumb, ctx);
}

function getSearchItems(cache, params = '', page, getBittorrent: string | boolean = false, embedThumb: string | boolean = false, ctx: Context) {
    checkFirstPage(page);
    const query = new URLSearchParams(params);
    for (const key of ['next', 'prev', 'page']) {
        query.delete(key);
    }
    return gatherItemsByPage(cache, `?${query}`, getBittorrent, embedThumb, ctx);
}

function getTagItems(cache, tag, page, getBittorrent: string | boolean = false, embedThumb: string | boolean = false, ctx: Context) {
    checkFirstPage(page);
    return gatherItemsByPage(cache, `tag/${encodeURIComponent(tag)}`, getBittorrent, embedThumb, ctx);
}

export default { getFavoritesItems, getSearchItems, getTagItems, hasCookie, fromEx };
