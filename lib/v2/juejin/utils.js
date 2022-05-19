const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({
    html: true,
});
// 加载文章页
async function load(id) {
    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/content_api/v1/article/detail',
        json: {
            article_id: id,
        },
    });
    let description;
    if (response.data.data) {
        description = md.render(response.data.data.article_info.mark_content) || response.data.data.article_info.content;
    }

    return { description };
}

const loadNews = async (link) => {
    const response = await got(link);
    const $ = cheerio.load(response.data);
    $('h1.title, .main-box .message').remove();
    return { description: $('.main-box .article').html() };
};

const ProcessFeed = (list, caches) =>
    Promise.all(
        list.map(async (item) => {
            const isArticle = !!item.article_info;
            const pubDate = parseDate((isArticle ? item.article_info.ctime : item.content_info.ctime) * 1000);
            const link = `https://juejin.cn${isArticle ? '/post/' + item.article_id : '/news/' + item.content_id}`;
            // 列表上提取到的信息
            const single = {
                title: isArticle ? item.article_info.title : item.content_info.title,
                description: ((isArticle ? item.article_info.brief_content : item.content_info.brief) || '无描述').replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, ''),
                pubDate,
                author: item.author_user_info.user_name,
                link,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(link, () => (isArticle ? load(item.article_id) : loadNews(link)));
            // 合并解析后的结果集作为该篇文章最终的输出结果
            return { ...single, ...other };
        })
    );

module.exports = {
    ProcessFeed,
};
