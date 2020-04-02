const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { userid } = ctx.params;
    const url = 'http://www.tianya.cn/' + userid + '/bbs?t=post';
    const responseraw = await got(url, { headers: { Referer: 'http://bbs.tianya.cn' } });
    const $ = cheerio.load(responseraw.data);
    const username = $('div.portrait h2 a').first().text();

    const turl = `http://www.tianya.cn/api/bbsuser?method=userinfo.ice.getUserTotalReplyList&params.userId=${userid}&params.pageSize=20&params.bMore=true`;
    const response = await got(turl, { headers: { Referer: 'http://bbs.tianya.cn' } });
    const json = response.data;
    const items = await Promise.all(
        json.data.rows.map(async (ele) => {
            const title = ele.title;
            const link = `http://bbs.tianya.cn/go_reply_position.jsp?item=${ele.item}&id=${ele.art_id}&rid=${ele.reply_id}`;
            const date = ele.reply_time;

            const commentData = await ctx.cache.tryGet(link, async () => {
                const commentResponse = await got(link, { headers: { Referer: 'http://bbs.tianya.cn' } });
                const res = cheerio.load(commentResponse.data)(`div[replyid='${ele.reply_id}'] div.atl-content div.bbs-content`).html();
                return res;
            });

            const pubDate = new Date(date).toUTCString();
            return Promise.resolve({
                title,
                description: commentData,
                link,
                pubDate,
            });
        })
    );
    ctx.state.data = {
        title: username + '的天涯回帖',
        description: username,
        link: url,
        item: items,
    };
};
