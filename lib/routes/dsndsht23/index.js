const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.sehuatang.net/';

const map = {
    mrhj: 'forum-106-1.html',
    gcyc: 'forum-2-1.html',
    yzwmyc: 'forum-36-1.html',
    yzymyc: 'forum-37-1.html',
    gqzwzm: 'forum-103-1.html',
    sjxz: 'forum-107-1.html',
    yzmzym: 'forum-104-1.html',
    vr: 'forum-102-1.html',
    omwm: 'forum-38-1.html',
    dmyc: 'forum-39-1.html',
    ai: 'forum-113-1.html',
    ydsc: 'forum-111-1.html',
};

module.exports = async (ctx) => {
    const subforumid = ctx.params.subforumid || 'gqzwzm';
    const link = `${host}${map[subforumid]}`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $('#threadlisttableid tbody')
        .slice(1, 21)
        .filter(function() {
            // 去除置顶帖子和分割线
            const threadID = $(this).attr('id');
            return typeof threadID !== 'undefined' && threadID !== 'separatorline' && !threadID.startsWith('stickthread');
        })
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

            const response = await got.get(itemUrl);

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
