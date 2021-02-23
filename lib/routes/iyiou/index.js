const got = require('@/utils/got');
const cheerio = require('cheerio');
const formatPubDate = require('@/utils/date.js');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://www.iyiou.com/news`,
    });
    const $ = cheerio.load(response.data);
    const postList = $('.list-container').find('.eo-article-column').get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item).find('.eo-hover-child').find('.content').find('a').find('.title').text();
            const link = 'https://www.iyiou.com' + $(item).find('.eo-hover-child').find('a').attr('href');
            const guid = link;
            const pubDate = formatPubDate($(item).find('.eo-hover-child').find('.content').find('.eo-post-date').text().replace(' ', ''));

            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: pubDate,
                description: '',
            };

            const description_key = 'iyiou' + guid;
            const description_value = await ctx.cache.get(description_key);

            if (description_value) {
                single.description = description_value;
            } else {
                const temp = await got(link);
                single.description = $(temp.data).find('.post-body').html();
                ctx.cache.set(description_key, single.description);
            }
            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '亿欧网', link: 'https://www.iyiou.com/', item: result };
};
