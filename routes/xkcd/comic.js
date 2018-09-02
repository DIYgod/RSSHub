const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://xkcd.com/info.0.json',
        headers: {
            Referer: 'https://www.xkcd.com',
        },
    });

    const data = JSON.parse(response.data);
    const postTime = new Date();
    postTime.setFullYear(parseInt(data.year), parseInt(data.month) - 1, parseInt(data.day));
    postTime.setHours(0, 0, 0, 0); // 无法获取精确时间

    ctx.state.data = {
        title: 'xkcd',
        link: 'https://www.xkcd.com',
        description: 'A webcomic of romance, sarcasm, math, and language.',
        item: [
            {
                title: data.title,
                description: `<img src="${data.img}"><br />${data.alt}`,
                pubDate: postTime.toUTCString(),
                link: 'https://www.xkcd.com/' + data.num,
                guid: data.num,
            },
        ],
    };
};
