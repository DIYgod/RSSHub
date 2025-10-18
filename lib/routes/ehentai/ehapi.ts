import got from '@/utils/got';
import logger from '@/utils/logger';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import path from 'node:path';
import { config } from '@/config';

const headers: any = {};
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

async function parsePage(cache, data, get_bittorrent = false, embed_thumb = false, my_tags = false) {
    const $ = load(data);
    let layout = 't';

    let galleries = $('div[class^="itg gld"]');
    if (galleries.length <= 0) {
        galleries = $('table[class^="itg gltm"] tbody');
        layout = 'm';
    }
    if (galleries.length <= 0) {
        galleries = $('table[class^="itg gltc"] tbody');
        layout = 'l';
    }
    if (galleries.length <= 0) {
        galleries = $('table[class^="itg glte"] tbody');
        layout = 'e';
    }
    if (galleries.length <= 0) {
        return [];
    }
    const layoutConfigs = {
        t: {
            // Thumbnail
            link_selector: 'div[class^="gl3t"] a',
            thumb_selector: 'div[class^="gl3t"] a img',
            category_selector: 'div.gl5t .cs',
            tags_selector: 'div.gl6t .gt',
            has_author: false,
        },
        m: {
            // Minimal, Minimal+
            link_selector: 'td[class^="gl3"] a',
            thumb_selector: 'td[class^=gl2] div.glthumb div img',
            category_selector: 'td.gl1c.glcat .cn',
            tags_selector: 'td.gl3c.glname div.gt',
            has_author: false,
        },
        l: {
            // Compact
            link_selector: 'td[class^="gl3"] a',
            thumb_selector: 'td[class^=gl2] div.glthumb div img',
            category_selector: 'td.gl1c.glcat .cn',
            tags_selector: 'td.gl3c.glname div.gt',
            has_author: true,
        },
        e: {
            // Extended
            link_selector: 'td[class^="gl1"] a',
            thumb_selector: 'td[class^="gl1"] a img',
            category_selector: 'div.gl3e .cn',
            tags_selector: 'table div[title]',
            has_author: true,
        },
    };

    // --- 辅助函数：处理缩略图 ---
    async function processThumbnail(el_img, cache) {
        let thumbnail = el_img.data('src') ?? el_img.attr('src');
        if (!thumbnail) {
            return '';
        }

        if (config.ehentai.img_proxy) {
            const url = new URL(thumbnail);
            thumbnail = config.ehentai.img_proxy + url.pathname + url.search;
        }

        if (embed_thumb) {
            return await ehgot_thumb(cache, thumbnail);
        }
        return thumbnail;
    }

    // --- 辅助函数：构建描述 ---
    function buildDescription(thumbnail, el, tags_selector) {
        let description = thumbnail ? `<img src='${thumbnail}' alt='thumbnail'>` : '';
        if (my_tags && tags_selector) {
            const highlighted_tags = el.find(`${tags_selector}[style]`);
            if (highlighted_tags.length > 0) {
                let highlighted_tags_html = '<p>';
                highlighted_tags.each((_, tag) => {
                    highlighted_tags_html += `<code>${$(tag).text()}</code>&nbsp;&nbsp;`;
                });
                highlighted_tags_html += '</p>';
                description += highlighted_tags_html;
            }
        }
        return description;
    }

    // --- 辅助函数：获取BT种子信息 ---
    async function getEnclosureInfo(el, cache) {
        const el_down = el.find('div.gldown');
        const bittorrent_page_url = el_down.find('a').attr('href');
        if (bittorrent_page_url) {
            const bittorrent_url = await getBittorrent(cache, bittorrent_page_url);
            if (bittorrent_url) {
                return {
                    enclosure_url: bittorrent_url,
                    enclosure_type: 'application/x-bittorrent',
                    bittorrent_page_url,
                };
            }
        }
        return null;
    }

    // --- 重构后的核心解析函数 ---
    async function parseElement(cache, element) {
        const el = $(element);
        const config = layoutConfigs[layout];

        // 1. 基本信息提取
        const title = el.find('.glink').html();
        const rawDate = el.find('div[id^="posted_"]').text();
        const el_a = el.find(config.link_selector);
        const link = el_a.attr('href');
        if (!title || !rawDate || !link) {
            return null; // 如果没有标题、日期或链接，则为无效条目
        }

        const pubDate = timezone(rawDate, 0);
        const category = el.find(config.category_selector).text();

        const tags = el
            .find(config.tags_selector)
            .toArray()
            .map((tag) => $(tag).attr('title'));

        // 2. 调用辅助函数处理复杂逻辑
        const thumbnail = await processThumbnail(el.find(config.thumb_selector), cache);
        const description = buildDescription(thumbnail, el, config.tags_selector);

        // 3. 组装核心 item
        const item: any = {
            title,
            description,
            pubDate,
            link,
            category: [`category:${category.toLowerCase()}`, ...(tags || [])],
        };

        // 4. 按需附加额外信息
        if (get_bittorrent) {
            const enclosure = await getEnclosureInfo(el, cache);
            if (enclosure) {
                Object.assign(item, enclosure);
            }
        }

        if (config.has_author) {
            item.author = el
                .find('div.gt[title^="artist:"]')
                .toArray()
                .map((tag) => $(tag).text())
                .join(' / ');
        }

        return item;
    }

    // --- 后续逻辑保持不变 ---
    const item_Promises: any[] = [];
    galleries.children().each((index, element) => {
        item_Promises.push(parseElement(cache, element));
    });
    const items_with_null = await Promise.all(item_Promises);

    const items: any[] = [];
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

async function gatherItemsByPage(cache, url, get_bittorrent = false, embed_thumb = false, my_tags = false) {
    const response = await ehgot(url);
    const items = await parsePage(cache, response.data, get_bittorrent, embed_thumb, my_tags);
    return updateBittorrent_url(cache, items);
}

async function getFavoritesItems(cache, favcat, inline_set, page, get_bittorrent = false, embed_thumb = false, my_tags = false) {
    const response = await ehgot(`favorites.php?favcat=${favcat}&inline_set=${inline_set}`);
    if (page) {
        return gatherItemsByPage(cache, `favorites.php?favcat=${favcat}&next=${page}`, get_bittorrent, embed_thumb, my_tags);
    } else {
        const items = await parsePage(cache, response.data, get_bittorrent, embed_thumb, my_tags);
        return updateBittorrent_url(cache, items);
    }
}

function getSearchItems(cache, params, page, get_bittorrent = false, embed_thumb = false, my_tags = false) {
    return page ? gatherItemsByPage(cache, `?${params}&next=${page}`, get_bittorrent, embed_thumb, my_tags) : gatherItemsByPage(cache, `?${params}`, get_bittorrent, embed_thumb, my_tags);
}

function getTagItems(cache, tag, page, get_bittorrent = false, embed_thumb = false, my_tags = false) {
    return page ? gatherItemsByPage(cache, `tag/${tag}?next=${page}`, get_bittorrent, embed_thumb, my_tags) : gatherItemsByPage(cache, `tag/${tag}`, get_bittorrent, embed_thumb, my_tags);
}

function getWatchedItems(cache, params, get_bittorrent = false, embed_thumb = false, my_tags = false) {
    const url = `watched?${params || ''}`;
    return gatherItemsByPage(cache, url, get_bittorrent, embed_thumb, my_tags);
}

function getPopularItems(cache, params, get_bittorrent = false, embed_thumb = false, my_tags = false) {
    const url = `popular?${params || ''}`;
    return gatherItemsByPage(cache, url, get_bittorrent, embed_thumb, my_tags);
}

async function getToplistItems(cache, tl, page, get_bittorrent = false, embed_thumb = false, my_tags = false) {
    let url = `toplist.php?tl=${tl}`;
    if (page) {
        url = `${url}&p=${page}`;
    }
    // toplist is e-hentai only
    const response = await got({ method: 'get', url: `https://e-hentai.org/${url}`, headers });
    const items = await parsePage(cache, response.data, get_bittorrent, embed_thumb, my_tags);
    return updateBittorrent_url(cache, items);
}

export default { getFavoritesItems, getSearchItems, getTagItems, getWatchedItems, getPopularItems, getToplistItems, has_cookie, from_ex };
