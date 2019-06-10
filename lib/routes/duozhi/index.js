const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got('http://www.duozhi.com/');
    const $ = cheerio.load(response.data);
    const postList = $('.post-list .post').get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item)
                .find('.post-title')
                .find('a')
                .text();
            const link = $(item)
                .find('.post-title')
                .find('a')
                .attr('href');
            const guid = link;

            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: '',
                description: '',
            };

            const description_key = 'duozhi_description_' + guid;
            const description_value = await ctx.cache.get(description_key);

            const pubDate_key = 'duozhi_pubDate_' + guid;
            const pubDate_value = await ctx.cache.get(pubDate_key);

            if (description_value && pubDate_value) {
                single.description = description_value;
                single.pubDate = pubDate_value;
            } else {
                const temp = await got(link);
                single.description = $(temp.data)
                    .find('.subject-content')
                    .html()
                    .replace(/alt="\\"/g, '');
                single.pubDate = new Date(
                    $(temp.data)
                        .find('.meta-date')
                        .text()
                        .substr(0, 18)
                ).toUTCString();

                ctx.cache.set(description_key, single.description);
                ctx.cache.set(pubDate_key, single.pubDate);
            }

            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '多知网', link: 'http://www.duozhi.com/', description: '独立商业视角 新锐教育观察', item: result };
};
