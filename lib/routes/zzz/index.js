const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('https://z-z-z.vip/feed');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('div.bpp-post-content');

        content.find('img').each((i, e) => {
            $(e).attr('src', $(e).attr('data-echo'));
        });

        return content.html();
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const response = await axios({
                method: 'get',
                url: item.link,
            });

            const single = {
                guid: item.guid,
                title: item.title,
                description: ProcessFeed(response.data),
                pubDate: item.pubDate,
                link: item.link,
                author: item['dc:creator'],
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '紫竹张先生',
        link: 'https://z-z-z.vip',
        description: '紫竹张先生',
        item: items,
    };
};
