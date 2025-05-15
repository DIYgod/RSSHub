const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got('http://www.duozhi.com/');
    const $ = cheerio.load(response.data);
    const postList = $('.list-post .post-item').get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item).find('.post-title').text();
            const link = $(item).find('.post-title').attr('href');
            const guid = link;

            const single = {
                title,
                link,
                guid,
                pubDate: '',
                description: '',
            };

            const key = 'duozhi_' + guid;
            const cache = await ctx.cache.get(key);

            if (cache) {
                const value = JSON.parse(cache);

                single.description = value.description;
                single.pubDate = value.pubDate;
            } else {
                const temp = await got(link);
                single.description = $(temp.data).find('.subject-content').html().replaceAll('alt="\\"', '');
                single.pubDate = new Date($(temp.data).find('.subject-meta').text().trim().slice(0, 18)).toUTCString();

                ctx.cache.set(key, {
                    description: single.description,
                    pubDate: single.pubDate,
                });
            }

            return single;
        })
    );
    ctx.state.data = { title: '多知网', link: 'http://www.duozhi.com/', description: '独立商业视角 新锐教育观察', item: result };
};
