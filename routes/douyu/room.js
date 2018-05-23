const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `http://open.douyucdn.cn/api/RoomApi/room/${id}`,
        headers: {
            'User-Agent': config.ua,
            Referer: `https://www.douyu.com/${id}`,
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `${data.owner_name}的斗鱼直播间`,
        link: `https://www.douyu.com/${id}`,
        item: [
            {
                title: data.room_name,
                pubDate: new Date(data.start_time).toUTCString(),
                guid: data.start_time,
                link: `https://www.douyu.com/${id}`,
            },
        ],
    };
};
