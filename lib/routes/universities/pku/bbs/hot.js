const config = require('@/config').value;
const cheerio = require('cheerio');
const got = require('@/utils/got');
const resolveUrl = require('url').resolve;

function parseDate(text) {
    const match = /[0-9 :-]+/.exec(text);
    if (match) {
        return new Date(match[0]).toUTCString();
    }
}

module.exports = async (ctx) => {
    const cookie = config.pkubbs.cookie;
    const headers = {};
    if (cookie) {
        headers.cookie = cookie;
    }
    const r = await got('https://bbs.pku.edu.cn/v2/hot-topic.php', { headers });
    const $ = cheerio.load(r.body);
    const listItems = $('#list-content .list-item')
        .map(function() {
            return {
                url: resolveUrl(
                    r.url,
                    $(this)
                        .find('> a.link')
                        .attr('href')
                ),
                title: $(this)
                    .find('.title')
                    .text(),
            };
        })
        .get()
        .slice(0, 10);

    const item = await Promise.all(
        listItems.map(
            async ({ url, title }) =>
                await ctx.cache.tryGet(url, async () => {
                    // try catch 处理部分无 Cookie 时无法访问的帖子
                    try {
                        const r = await got(url, { headers });
                        const $ = cheerio.load(r.body);
                        return {
                            title,
                            description: $('.post-card:first-child .content').html(),
                            link: url,
                            guid: url,
                            pubDate: parseDate($('.post-card:first-child .sl-triangle-container .title span').text()),
                        };
                    } catch (error) {
                        return {
                            title,
                            link: url,
                            guid: url,
                        };
                    }
                })
        )
    );
    ctx.state.data = {
        title: '北大未名BBS 全站十大',
        link: 'https://bbs.pku.edu.cn/v2/hot-topic.php',
        description: '北大未名BBS 全站热门话题前十名',
        item,
    };
};
