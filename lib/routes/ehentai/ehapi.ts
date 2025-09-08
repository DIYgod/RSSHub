import got from '@/utils/got';
import logger from '@/utils/logger';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import path from 'node:path';
import { config } from '@/config';

const headers = {};
const has_cookie = config.ehentai.ipb_member_id && config.ehentai.ipb_pass_hash && config.ehentai.sk;
const from_ex = has_cookie && config.ehentai.igneous;
if (has_cookie) {
    if (from_ex) {
        const { ipb_member_id, ipb_pass_hash, sk, igneous } = config.ehentai;
        headers.cookie = `ipb_member_id=${ipb_member_id};ipb_pass_hash=${ipb_pass_hash};sk=${sk};igneous=${igneous}`;
    } else {
        const { ipb_member_id, ipb_pass_hash, sk } = config.ehentai;
        headers.cookie = `ipb_member_id=${ipb_member_id};ipb_pass_hash=${ipb_pass_hash};sk=${sk}`;
    }
}

if (config.ehentai.star) {
    headers.cookie += `;star=${config.ehentai.star}`;
}

function ehgot(url) {
    return from_ex ? got({ method: 'get', url: `https://exhentai.org/${url}`, headers }) : got({ method: 'get', url: `https://e-hentai.org/${url}`, headers });
}

function ehgot_thumb(cache, thumb_url) {
    return cache.tryGet(thumb_url, async () => {
        try {
            const buffer = await got({ method: 'get', responseType: 'buffer', url: thumb_url, headers });
            const data = buffer.body.toString('base64');
            const ext = path.extname(thumb_url).slice(1);
            return `data:image/${ext};base64,${data}`;
        } catch (error) {
            logger.warn('Cannot download thumbnail: ' + thumb_url, error);
            return thumb_url;
        }
    });
}

async function parsePage(cache, data, get_bittorrent = false, embed_thumb = false) {
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

    async function parseElement(cache, element) {
        const el = $(element);
        const title = el.find('.glink').html();
        const rawDate = el.find('div[id^="posted_"]').text();
        const pubDate = rawDate ? timezone(rawDate, 0) : rawDate;
        let el_a;
        let el_img;
        // match layout
        if ('mpl'.includes(layout)) {
            // Minimal, Minimal+, Compact
            el_a = el.find('td[class^="gl3"] a');
            el_img = el.find('td[class^=gl2] div.glthumb div img');
        } else if (layout === 'e') {
            // Extended
            el_a = el.find('td[class^="gl1"] a');
            el_img = el_a.find('img');
        } else if (layout === 't') {
            // Thumbnail
            el_a = el.find('div[class^="gl3t"] a');
            el_img = el_a.find('img');
        }
        const link = el_a.attr('href');
        let thumbnail = el_img.data('src') ?? el_img.attr('src');
        if (config.ehentai.img_proxy && thumbnail) {
            const url = new URL(thumbnail);
            thumbnail = config.ehentai.img_proxy + url.pathname + url.search;
        }
        if (embed_thumb && thumbnail) {
            thumbnail = await ehgot_thumb(cache, thumbnail);
        }
        const description = `<img src='${thumbnail}' alt='thumbnail'>`;
        if (title && link) {
            const item = { title, description, pubDate, link };
            if (get_bittorrent) {
                const el_down = el.find('div.gldown');
                const bittorrent_page_url = el_down.find('a').attr('href');
                if (bittorrent_page_url) {
                    const bittorrent_url = await getBittorrent(cache, bittorrent_page_url);
                    if (bittorrent_url) {
                        item.enclosure_url = bittorrent_url;
                        item.enclosure_type = 'application/x-bittorrent';
                        item.bittorrent_page_url = bittorrent_page_url;
                    }
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
    }

    const item_Promises = [];
    galleries.children().each((index, element) => {
        item_Promises.push(parseElement(cache, element));
    });
    const items_with_null = await Promise.all(item_Promises);

    const items = [];
    for (const item of items_with_null) {
        if (item) {
            items.push(item);
        }
    }
    return items;
}

let p = '';

function getBittorrent(cache, bittorrent_page_url) {
    return cache.tryGet(bittorrent_page_url, async () => {
        try {
            const response = await got({ method: 'get', url: bittorrent_page_url, headers });
            const $ = load(response.data);
            const el_forms = $('form').toArray();
            let bittorrent_url;
            for (const el_form of el_forms) {
                const el_a = $(el_form).find('a');
                const onclick = el_a.attr('onclick');
                if (onclick) {
                    const match = onclick.match(/'(.*?)'/);
                    if (match) {
                        bittorrent_url = match[1];
                        const match_p = bittorrent_url.match(/torrent\?p=(.*?)$/);
                        if (match_p) {
                            p = match_p[1];
                        }
                    }
                }
            }
            return bittorrent_url;
        } catch {
            return;
        }
    });
}

function updateBittorrent_url(cache, items) {
    // 下种子文件需要动态密码，密码每几次请求就更新一次
    for (const item of items) {
        if (item.enclosure_url) {
            item.enclosure_url = item.enclosure_url.replace(/torrent\?p=.*$/, `torrent?p=${p}`);
            cache.set(item.bittorrent_page_url, item.enclosure_url);
        }
    }
    return items;
}

async function gatherItemsByPage(cache, url, get_bittorrent = false, embed_thumb = false) {
    const response = await ehgot(url);
    const items = await parsePage(cache, response.data, get_bittorrent, embed_thumb);
    return updateBittorrent_url(cache, items);
}

async function getFavoritesItems(cache, favcat, inline_set, page, get_bittorrent = false, embed_thumb = false) {
    const response = await ehgot(`favorites.php?favcat=${favcat}&inline_set=${inline_set}`);
    if (page) {
        return gatherItemsByPage(cache, `favorites.php?favcat=${favcat}&next=${page}`, get_bittorrent, embed_thumb);
    } else {
        const items = await parsePage(cache, response.data, get_bittorrent, embed_thumb);
        return updateBittorrent_url(cache, items);
    }
}

function getSearchItems(cache, params, page, get_bittorrent = false, embed_thumb = false) {
    return page ? gatherItemsByPage(cache, `?${params}&next=${page}`, get_bittorrent, embed_thumb) : gatherItemsByPage(cache, `?${params}`, get_bittorrent, embed_thumb);
}

function getTagItems(cache, tag, page, get_bittorrent = false, embed_thumb = false) {
    return page ? gatherItemsByPage(cache, `tag/${tag}?next=${page}`, get_bittorrent, embed_thumb) : gatherItemsByPage(cache, `tag/${tag}`, get_bittorrent, embed_thumb);
}

export default { getFavoritesItems, getSearchItems, getTagItems, has_cookie, from_ex };
