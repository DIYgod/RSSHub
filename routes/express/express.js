const axios = require('axios');
const art = require('art-template');
const path = require('path');
const config = require('../../config');

module.exports = async (ctx, next) => {
    const company = ctx.params.company;
    const number = ctx.params.number;

    const response = await axios({
        method: 'get',
        url: `https://www.kuaidi100.com/query?type=${company}&postid=${number}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': 'https://www.kuaidi100.com'
        }
    });

    const data = response.data.data;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `快递 ${company}-${number}`,
        link: 'https://www.kuaidi100.com',
        description: `快递 ${company}-${number}`,
        lastBuildDate: new Date().toUTCString(),
        item: data.map((item) => ({
            title: item.context,
            description: item.context,
            pubDate: new Date(item.time || item.ftime).toUTCString(),
            link: item.context
        })),
    });

    next();
};