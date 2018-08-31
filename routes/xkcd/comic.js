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

    ctx.state.data = {
        title: 'xkcd',
        link: 'https://www.xkcd.com',
        description: data.alt,
        item: [
            {
                title: data.title,
                description: data.alt,
                pubDate: data.year + data.month + data.day,
                link: 'https://www.xkcd.com' + data.num,
                guid: data.num,
                itunes_item_image: data.img,
            },
        ],
    };
};
