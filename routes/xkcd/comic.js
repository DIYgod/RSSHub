const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios.get('https://xkcd.com/info.0.json');

    const result = response.data;
    const postTime = new Date();
    postTime.setFullYear(parseInt(result.year), parseInt(result.month) - 1, parseInt(result.day));
    postTime.setHours(0, 0, 0, 0); // 无法获取精确时间

    ctx.state.data = {
        title: 'xkcd',
        link: 'https://www.xkcd.com',
        description: 'A webcomic of romance, sarcasm, math, and language.',
        item: [
            {
                title: result.title,
                description: `<img src="${result.img}"><br />${result.alt}`,
                pubDate: postTime.toUTCString(),
                link: 'https://www.xkcd.com/' + result.num,
                guid: result.num,
            },
        ],
    };
};
