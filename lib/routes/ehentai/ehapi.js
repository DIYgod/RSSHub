const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value.ehentai;

const headers = {};
const has_cookie = config.ipb_member_id && config.ipb_pass_hash && config.sk;
if (has_cookie) {
    const ipb_member_id = config.ipb_member_id;
    const ipb_pass_hash = config.ipb_pass_hash;
    const sk = config.sk;
    headers.cookie = `ipb_member_id=${ipb_member_id};ipb_pass_hash=${ipb_pass_hash};sk=${sk}`;
}

function generalGot(url) {
    return got({
        method: 'get',
        url: url,
        headers: headers,
    });
}

function ehgot(url) {
    return generalGot(`https://e-hentai.org/${url}`);
}

ehgot.has_cookie = has_cookie;

async function parsePage(cache, data, get_bittorrent = false) {
    const $ = cheerio.load(data);
    const table = $('table[class="itg gltc"] tbody');
    if (!table) {
        return [];
    }

    async function parseTableRow(cache, element) {
        const el = $(element);
        const el_a = el.find('td[class="gl3c glname"] a');
        const el_img = el.find('td.gl2c div.glthumb div img');
        const title = el_a.find('div.glink').html();
        const thumbnail = el_img.attr('data-src') ? el_img.attr('data-src') : el_img.attr('src');
        const description = `<img src='${thumbnail}'>`;
        const pubDate = el.find('div[id^="posted_"]').html();
        const link = el_a.attr('href');
        if (title && link) {
            const item = { title, description, pubDate, link };
            if (get_bittorrent) {
                const el_down = el.find('td.gl2c div div.gldown');
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
            return item;
        }
    }

    const item_Promises = [];
    table.children('tr').each((index, element) => {
        item_Promises.push(parseTableRow(cache, element));
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

async function getBittorrent(cache, bittorrent_page_url) {
    return await cache.tryGet(bittorrent_page_url, async () => {
        try {
            const response = await generalGot(bittorrent_page_url);
            const $ = cheerio.load(response.data);
            const el_forms = $('form').get();
            let bittorrent_url = undefined;
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
                        break;
                    }
                }
            }
            return bittorrent_url;
        } catch {
            return undefined;
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

async function gatherItemsByPage(cache, urls, get_bittorrent = false) {
    const items_Promises = [];
    for (const url of urls) {
        items_Promises.push((async (url) => await parsePage(cache, (await ehgot(url)).data, get_bittorrent))(url));
    }
    const items_list = await Promise.all(items_Promises);
    let items = [];
    for (const i of items_list) {
        items = items.concat(i);
    }
    return updateBittorrent_url(cache, items);
}

async function getFavoritesItems(cache, page, favcat, inline_set, get_bittorrent = false) {
    const response = await ehgot(`favorites.php?favcat=${favcat}&inline_set=${inline_set}`);
    let items = await parsePage(cache, response.data, get_bittorrent);
    if (page !== 0) {
        const urls = [];
        for (let i = 1; i <= page; i++) {
            urls.push(`favorites.php?page=${i}&favcat=${favcat}`);
        }
        items = items.concat(await gatherItemsByPage(cache, urls, get_bittorrent));
    }
    return updateBittorrent_url(cache, items);
}

async function getSearchItems(cache, params, page = undefined, get_bittorrent = false) {
    const urls = [`?${params}`];
    for (let i = 1; i <= page; i++) {
        urls.push(`?page=${i}&${params}`);
    }
    return await gatherItemsByPage(cache, urls, get_bittorrent);
}

async function getTagItems(cache, tag, page, get_bittorrent = false) {
    const urls = [`tag/${tag}`];
    for (let i = 1; i <= page; i++) {
        urls.push(`tag/${tag}/${i}`);
    }
    return await gatherItemsByPage(cache, urls, get_bittorrent);
}

module.exports = { getFavoritesItems, getSearchItems, getTagItems };
