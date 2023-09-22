const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.niaogebiji.com';
    const { data: response } = await got(`${baseUrl}/pc/index/getMoreArticle`);

    if (response.return_code !== '200') {
        throw Error(response.return_msg);
    }

    const postList = response.return_data.map((item) => ({
        title: item.title,
        description: item.summary,
        author: item.author,
        pubDate: parseDate(item.published_at, 'X'),
        updated: parseDate(item.updated_at, 'X'),
        category: [item.catname, ...item.tag_list],
        link: new URL(item.link, baseUrl).href,
    }));

    const result = await Promise.all(
        postList.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('.pc_content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '鸟哥笔记',
        link: baseUrl,
        item: result,
    };
};
