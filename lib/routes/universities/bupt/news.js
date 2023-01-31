const config = require('@/config').value;
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { CookieJar } = require('tough-cookie');

const cookieJar = new CookieJar();
if (config.bupt.portal_cookie) {
    cookieJar.setCookie(config.bupt.portal_cookie, 'https://wx.bupt.edu.cn');
}

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://wx.bupt.edu.cn/portal-article-page/article-list/news?limit=10&offset=0`,
        cookieJar,
    });
    const data = response.data;
    const out = data.map((item) => ({
        title: item.title,
        description: item.content,
        pubDate: timezone(parseDate(item.createtime, 'YYYY-MM-DD hh:mm:ss'), +8),
        link: `https://wx.bupt.edu.cn/portal-article-page/article/news/${item.id}/`,
        author: item.author,
    }));

    ctx.state.data = {
        title: '北京邮电大学校园新闻',
        link: 'https://wx.bupt.edu.cn/portal-article-page/article-list/news?limit=10&offset=0',
        item: out,
    };
};
