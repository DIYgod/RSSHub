const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.sehuatang.net/';

const forumIdMaps = {
    mrhj: '106',
    gcyc: '2',
    yzwmyc: '36',
    yzymyc: '37',
    gqzwzm: '103',
    sjxz: '107',
    yzmzym: '104',
    vr: '102',
    omwm: '38',
    dmyc: '39',
    ai: '113',
    ydsc: '111',
};

module.exports = async (ctx) => {
    const subformName = ctx.params.subforumid || 'gqzwzm';
    const subformId = subformName in forumIdMaps ? forumIdMaps[subformName] : subformName;
    const typefilter = ctx.params.type ? `&filter=typeid&typeid=${ctx.params.type}` : '';
    const link = `${host}forum.php?mod=forumdisplay&fid=${subformId}${typefilter}`;
    const headers = {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    };
    let c;
    const response = await got({
        method: 'get',
        url: link,
        headers: headers,
        hooks: {
            beforeRedirect: [
                (options, response) => {
                    const cookie = response.headers['set-cookie'];
                    if (cookie) {
                        const cook = cookie.map((c) => c.split(';')[0]).join('; ');
                        options.headers.Cookie = cook;
                        c = cook;
                        options.headers.Referer = response.url;
                    }
                },
            ],
        },
    });
    headers.Cookie = c;
    const $ = cheerio.load(response.data);

    const list = $('#threadlisttableid tbody[id^=normalthread]')
        .slice(0, 11)
        .map(function() {
            const info = {
                title:
                    '[' +
                    $(this)
                        .find('th em a')
                        .text() +
                    '] ' +
                    $(this)
                        .find('a.xst')
                        .text(),
                link: $(this)
                    .find('a.xst')
                    .attr('href'),
                date: $(this)
                    .find('td.by')
                    .find('em span span')
                    .attr('title'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = host + info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl, { headers: headers });

            const $ = cheerio.load(response.data);
            const postMessage = $("td[id^='postmessage']").slice(0, 1);
            const images = $(postMessage).find('img');
            for (let k = 0; k < images.length; k++) {
                if (!$(images[k]).attr('file') || $(images[k]).attr('file') === 'undefined') {
                    $(images[k]).replaceWith('');
                } else {
                    $(images[k]).replaceWith(`<img src="${$(images[k]).attr('file')}" />`);
                }
            }
            const description = (postMessage.html() || '原帖已被删除').replace(/ignore_js_op/g, 'div');
            const enclosureUrl = postMessage.find('div.blockcode li').text();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
                enclosure_url: enclosureUrl,
                enclosure_type: 'application/x-bittorrent',
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `色花堂 - ${$('#pt > div:nth-child(1) > a:last-child').text()}`,
        link: link,
        item: out,
    };
};
