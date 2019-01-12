const axios = require('../../utils/axios');
const utils = require('./utils');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('http://www.qdaily.com/feed.xml');
    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            const response = await axios({
                method: 'get',
                url: item.link,
            });

            const description = utils.ProcessFeed(response.data);

            const single = {
                title: item.title,
                link: item.link,
                description,
                pubDate: item.pubDate,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '好奇心日报',
        link: 'http://www.qdaily.com',
        description: '好奇心日报以商业视角观察生活并启发你的好奇心，囊括商业报道、科技新闻、生活方式等各个领域，致力成为这个时代最好的媒体，为用户提供最好的新闻资讯。',
        item: items,
    };
};
