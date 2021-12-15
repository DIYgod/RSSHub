const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';
const get_articles = async () => {
    const url = `${baseURL}api/bulletin/selectBulletinList`;
    const response = (await got.get(url)).data;
    const { data } = response;
    return data;
};
const get_article_info = async (article) => {
    const { updateDate, titleEn, id, title } = article;
    const articleUrl = `${baseURL}zh/latest/${id}`;
    const res = await got(articleUrl);
    const $ = cheerio.load(res.data);
    const description = $('.detail_html_box').html();
    return {
        // 文章标题
        title: `${title} | ${titleEn}`,
        // 文章正文
        description,
        // 文章发布时间
        pubDate: new Date(updateDate).toUTCString(),
        // 文章链接
        link: articleUrl,
    };
};
module.exports = async (ctx) => {
    const articles = await get_articles();
    const list = await Promise.all(articles.map(get_article_info));
    ctx.state.data = {
        title,
        link,
        item: list,
    };
};
