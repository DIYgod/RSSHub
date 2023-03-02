const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';

module.exports = async (ctx) => {
    const lang = ctx.params.lang ?? 'zh';

    const getBlogs = async () => {
        const url = `${baseURL}api/user/search/getAllList`;
        const response = (
            await got.post(url, {
                form: {
                    isRecommend: 2,
                    language: lang === 'zh' ? 'cn' : lang,
                },
            })
        ).data;
        return response.data.blogsList;
    };

    const getBlogInfomation = async (blog) => {
        const { publishDate, title, id } = blog;
        const blogUrl = `${baseURL}${lang}/blogs/${id}`;
        const description = await ctx.cache.tryGet(blogUrl, async () => {
            const res = await got(blogUrl);
            const $ = cheerio.load(res.data);
            const description = $('.detail_html_box').html();
            return description;
        });
        return {
            // 文章标题
            title,
            // 文章正文
            description,
            // 文章发布时间
            pubDate: parseDate(publishDate),
            // 文章链接
            link: blogUrl,
        };
    };
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;
    const blogs = (await getBlogs()).slice(0, limit);
    const list = await Promise.all(blogs.map(getBlogInfomation));
    ctx.state.data = {
        title: `${lang === 'zh' ? '博客' : 'Blogs'} | ${title}`,
        link: `${link}${lang}/blogs`,
        item: list,
    };
};
