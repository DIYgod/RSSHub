const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';
const getBlogs = async () => {
    const url = `${baseURL}api/user/search/getAllList`;
    const response = (
        await got.post(url, {
            form: {
                isRecommend: 2,
                language: 'cn',
            },
        })
    ).data;
    return response.data.blogsList;
};
module.exports = async (ctx) => {
    const getBlogInfomation = async (blog) => {
        const { publishDate, title, id } = blog;
        const blogUrl = `${baseURL}zh/blogs/${id}`;
        const description = await ctx.cache.tryGet(blogUrl, async () => {
            const res = await got(blogUrl);
            const $ = cheerio.load(res.data);
            const description = $('.detail_html_box').html();
            return description;
        });
        return {
            // 文章标题
            title: String(title),
            // 文章正文
            description,
            // 文章发布时间
            pubDate: new Date(publishDate).toUTCString(),
            // 文章链接
            link: blogUrl,
        };
    };
    const blogs = (await getBlogs()).slice(0, 100);
    const list = await Promise.all(blogs.map(getBlogInfomation));
    ctx.state.data = {
        title,
        link,
        item: list,
    };
};
