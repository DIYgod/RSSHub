const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { userid } = ctx.params;
    const url = 'http://www.tianya.cn/' + userid + '/bbs?t=post';
    const responseraw = await got(url, { headers: { Referer: 'http://bbs.tianya.cn' } });
    const $ = cheerio.load(responseraw.data);
    const username = $('div.portrait h2 a').first().text();

    const turl = `http://www.tianya.cn/api/bbsuser?method=userinfo.ice.getUserTotalArticleList&params.userId=${userid}&params.pageSize=20&params.bMore=true`;
    const response = await got(turl, { headers: { Referer: 'http://bbs.tianya.cn' } });
    const json = response.data;
    const items = json.data.rows.map((ele) => {
        const title = ele.title;
        const clicknum = ` 点击数：${ele.click_counter}，回复数：${ele.reply_counter}`;
        const link = `http://bbs.tianya.cn/post-${ele.item}-${ele.art_id}-1.shtml`;
        const date = ele.compose_time;

        const pubDate = new Date(date).toUTCString();
        return {
            title,
            description: title + clicknum,
            link,
            pubDate,
        };
    });
    ctx.state.data = {
        title: username + '的天涯帖子',
        description: username,
        link: url,
        item: items,
    };
};
