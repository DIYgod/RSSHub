const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'https://www.dsndsht23.com/';

const map = {
    hrxazp: 'forum-98-1.html',
    hrjpq: 'forum-50-1.html',
    yzxa: 'forum-48-1.html',
    omxa: 'forum-49-1.html',
    ktdm: 'forum-117-1.html',
};

module.exports = async (ctx) => {
    const subforumid = ctx.params.subforumid || 'hrxazp';

    const link = `https://www.dsndsht23.com/${map[subforumid]}`;
    const response = await got.get(link);
    const $ = cheerio.load(response.body);

    const list = $('#threadlisttableid tbody')
        .slice(1, 21)
        .filter(function() {
            // 去除置顶帖子和分割线
            const threadID = $(this).attr('id');
            return threadID !== 'separatorline' && !threadID.startsWith('stickthread');
        })
        .map(function() {
            const info = {
                title: $(this)
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
            let description = '';
            for (let k = 0; k < images.length; k++) {
                if (!$(images[k]).attr('file') || $(images[k]).attr('file') === 'undefined') {
                    $(images[k]).replaceWith('');
                } else {
                    // $(images[k]).replaceWith(`<img src="${$(images[k]).attr('file')}" referrerpolicy="no-referrer" />`);
                    description += `<img src="${$(images[k]).attr('file')}" referrerpolicy="no-referrer" />`;
                }
            }
            // const description = postMessage.html();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
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
