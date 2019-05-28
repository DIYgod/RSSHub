const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('https://www.idownloadblog.com/feed');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('div.post-content');

        content.find('.lazy-hidden').each((i, e) => {
            $(e).attr('src', $(e).attr('data-src'));
        });

        return content.html();
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const response = await axios({
                method: 'get',
                url: item.link,
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
                author: item['dc:creator'],
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'iDownloadBlog',
        link: 'https://www.idownloadblog.com/',
        description: 'iDownloadBlog',
        item: items,
    };
};
