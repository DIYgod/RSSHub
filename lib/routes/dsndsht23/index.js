const axios = require('@/utils/axios');
const cheerio = require('cheerio');

const host = 'https://www.dsndsht23.com/';

module.exports = async (ctx) => {
    const link = `https://www.dsndsht23.com/forum-103-1.html`;
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const list = $('#threadlisttableid tbody')
        .slice(1, 21)
        .filter(function() {
            // 去除置顶帖子和分割线
            const threadID = $(this).attr('id');
            return threadID !== 'separatorline' && !threadID.startsWith('stickthread');
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
                    .text(),
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

            const response = await axios.get(itemUrl);

            const $ = cheerio.load(response.data);
            const postMessage = $("td[id^='postmessage']");
            const description = postMessage.html();
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
        title: `色花堂中文论坛`,
        link: link,
        item: out,
    };
};
