const got = require('@/utils/got');
const bbcode = require('bbcodejs');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    let url;
    let title;
    if (category === 'new') {
        url = 'https://api.1point3acres.com/api/threads?type=new&pg=1&ps=20&includes=summary';
        title = '最新帖子';
    } else {
        url = 'https://api.1point3acres.com/api/threads?type=hot&pg=1&ps=20&includes=summary';
        title = '热门帖子';
    }
    const responseBasic = await got({
        method: 'get',
        url,
    });
    const data = responseBasic.data.threads;
    const bbcodeParser = new bbcode.Parser();

    const items = await Promise.all(
        data.map(async (item) => {
            const result = {
                title: `${item.subject}`,
                description: `${item.summary}...<br><br><small>作者 ${item.author} · 回复 ${item.replies} · 查看 ${item.views}</small>`,
                link: `https://instant.1point3acres.com/thread/${item.tid}`,
            };
            try {
                await ctx.cache.tryGet(item.link, async () => {
                    const detail = await got({
                        method: 'get',
                        url: `https://api.1point3acres.com/instant/threads/${item.tid}`,
                        referer: 'https://instant.1point3acres.com/',
                    });

                    result.description = `${bbcodeParser.toHTML(detail.data.thread.message_bbcode)}<br><br><small>作者 ${item.author} · 回复 ${item.replies} · 查看 ${item.views}</small>`;
                });
            } catch (error) {
                // nothing
            }
            return result;
        })
    );
    ctx.state.data = {
        title: `一亩三分地 - ${title}`,
        link: `https://www.1point3acres.com/bbs/`,
        item: items,
    };
};
