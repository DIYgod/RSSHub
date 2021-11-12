const cheerio = require('cheerio');
const got = require('@/utils/got');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const cid = ctx.params.cid;
    const url = 'http://www.ifnews.com';
    const respones = await got({
        method: 'get',
        url: `http://api.ifnews.com/api/getArticles?cid=${cid}`,
        headers: {
            Referer: `${url}/column.html?cid=${cid}`,
        },
    });
    const data = respones.data;

    const list = data.list.map((item) => ({
        title: item.title,
        author: item.createUser,
        link: `${url}/news.html?aid=${item.fileID}`,
        pubDate: date(item.publishTime, +8),
        aid: item.fileID,
    }));

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            // 页面数据
            const contentResponse = await got({
                method: 'get',
                url: `http://api.ifnews.com/api/getArticle?aid=${item.aid}`,
                headers: {
                    Referer: item.link,
                },
            });
            const content = contentResponse.data;

            // 页面框架
            const pageResponse = await got.get(item.link);
            const pageElement = cheerio.load(pageResponse.data);
            const pageHTML = pageElement('.content').html();

            // 填充页面框架使其变成真正的文章
            // 主要处理一些被{{xxx}}框起来的变量
            // 确实, 一排replace看起来很吓人, 如果有人有更好的方法实现就好了
            // 我也试过用MDN上eval()页面教的构造function对象的方法来直接执行{{}}内的js代码, 但是好像效果不佳...
            item.description = pageHTML
                .replace(/<div class="shareBox">[\s\S]*<\/ul>/, '') // 去掉后面的评论区跟分享区
                .replace('{{content.leadTitle}}', content.leadTitle)
                .replace('{{content.title}}', content.title)
                .replace('{{content.subTitle}}', content.subTitle)
                .replace(/\{\{content\.publishTime\?.*?\}\}/, content.publishTime)
                .replace('{{content.source}}', content.source)
                .replace('{{content.author}}', content.author)
                .replace('{{content.abstract}}', content.abstract)
                .replace('{{content.editor}}', content.editor)
                .replace('<div class="centerText" v-html="content.content"></div>', content.content);

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `人民日报社 国际金融报 ${data.column.columnName}`,
        link: url,
        item: result,
    };
};
