const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    let feed, title, link;

    // 为了向下兼容，这里 site 对应的是中文网文档中的 lang，英文网文档中的 channel
    // 英文网不会用到 channel
    const { site, channel } = ctx.params;

    if (site) {
        switch (site.toLowerCase()) {
            case 'chinese':
                title = 'BBC News 中文网';

                if (!channel) {
                    feed = await parser.parseURL('http://www.bbc.co.uk/zhongwen/simp/index.xml');
                } else {
                    feed = await parser.parseURL(`http://www.bbc.co.uk/zhongwen/simp/${channel}/index.xml`);
                }
                break;

            case 'traditionalchinese':
                title = 'BBC News 中文網';

                if (!channel) {
                    feed = await parser.parseURL('http://www.bbc.co.uk/zhongwen/trad/index.xml');
                } else {
                    feed = await parser.parseURL(`http://www.bbc.co.uk/zhongwen/trad/${channel}/index.xml`);
                }
                link = 'https://www.bbc.com/zhongwen/trad';
                break;

            // default to bbc.com
            default:
                feed = await parser.parseURL(`https://feeds.bbci.co.uk/news/${site.split('-').join('/')}/rss.xml`);
                title = `BBC News ${site}`;
                link = `https://www.bbc.co.uk/news/${site.split('-').join('/')}`;
                break;
        }
    } else {
        feed = await parser.parseURL('https://feeds.bbci.co.uk/news/rss.xml');
        title = 'BBC News Top Stories';
        link = 'https://www.bbc.co.uk/news';
    }

    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            const response = await got({
                method: 'get',
                url: item.link,
            });

            const $ = cheerio.load(response.data);

            let description;

            if (response.request.options.url.pathname.startsWith('/news/av')) {
                description = utils.ProcessAVFeed($, item.link);
            } else {
                description = utils.ProcessFeed($, item.link);
            }

            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        link,
        description: title,
        item: items,
    };
};
