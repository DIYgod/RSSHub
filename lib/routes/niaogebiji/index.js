const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://www.niaogebiji.com/`,
    });
    const $ = cheerio.load(response.data);
    const postList = $('.articleListBox').find('.articleBox').get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item).find('.article').find('a').find('.articleTitle').text();
            const link = 'https://www.niaogebiji.com' + $(item).find('.article').find('a').attr('href');
            const guid = link;
            const pubDate = new Date(parseInt($(item).attr('data-timepoint')) * 1000).toUTCString();

            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: pubDate,
                description: '',
            };

            const description_key = 'niaogebiji' + guid;
            const description_value = await ctx.cache.get(description_key);

            if (description_value) {
                single.description = description_value;
            } else {
                const temp = await got(link);
                single.description = $(temp.data).find('.article').find('.pc_content').html();
                ctx.cache.set(description_key, single.description);
            }
            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '鸟哥笔记', link: 'https://www.niaogebiji.com/', item: result };
};
