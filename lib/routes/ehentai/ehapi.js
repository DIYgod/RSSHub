const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value.ehentai;

function full_url(url) {
    return `https://e-hentai.org/${url}`;
}

function MakeEhGot() {
    const headers = { Host: 'e-hentai.org' };
    const has_cookie = config.ipb_member_id && config.ipb_pass_hash && config.ipd_session_id && config.sk;
    if (has_cookie) {
        const ipb_member_id = config.ipb_member_id;
        const ipb_pass_hash = config.ipb_pass_hash;
        const ipd_session_id = config.ipd_session_id;
        const sk = config.sk;
        headers.cookie = `ipb_member_id=${ipb_member_id};ipb_pass_hash=${ipb_pass_hash};ipd_session_id=${ipd_session_id};sk=${sk}`;
    }

    function ehgot(url) {
        return got({
            method: 'get',
            url: full_url(url),
            headers: headers,
        });
    }

    ehgot.has_cookie = has_cookie;
    return ehgot;
}

function parsePage(data) {
    const $ = cheerio.load(data);
    const table = $('table[class="itg gltc"] tbody');
    if (!table) {
        return [];
    }
    const item = [];
    table.children('tr').each((index, element) => {
        const el = $(element);
        const el_a = el.find('td[class="gl3c glname"] a');
        const el_img = el.find('td.gl2c div.glthumb div img');
        const title = el_a.find('div.glink').html();
        const thumbnail = el_img.attr('data-src') ? el_img.attr('data-src') : el_img.attr('src');
        const description = `<img src='${thumbnail}'>`;
        const pubDate = el.find('div[id^="posted_"]').html();
        const link = el_a.attr('href');
        if (title && link) {
            item.push({ title, description, pubDate, link });
        }
    });
    return item;
}

module.exports = function MakeEhItemsAPI() {
    const ehgot = MakeEhGot();

    async function getFavoritesItems(page, favcat, inline_set) {
        const response = await ehgot(`favorites.php?favcat=${favcat}&inline_set=${inline_set}`);
        let items = parsePage(response.data);
        if (page !== 0) {
            for (let i = 1; i <= page; i++) {
                // eslint-disable-next-line no-await-in-loop
                const response = await ehgot(`favorites.php?page=${i}&favcat=${favcat}`);
                items = items.concat(parsePage(response.data));
            }
        }
        return items;
    }

    async function getSearchItems(params, page = undefined) {
        let items = [];
        if (page) {
            for (let i = 0; i <= page; i++) {
                // eslint-disable-next-line no-await-in-loop
                const response = await ehgot(`?page=${i}&${params}`);
                items = items.concat(parsePage(response.data));
            }
        } else {
            const response = await ehgot(`?${params}`);
            items = parsePage(response.data);
        }
        return items;
    }

    async function getTagItems(tag, page) {
        const response = await ehgot(`tag/${tag}`);
        let items = parsePage(response.data);
        if (page !== 0) {
            for (let i = 1; i <= page; i++) {
                // eslint-disable-next-line no-await-in-loop
                const response = await ehgot(`tag/${tag}/${i}`);
                items = items.concat(parsePage(response.data));
            }
        }
        return items;
    }

    return { getFavoritesItems, getSearchItems, getTagItems };
};
