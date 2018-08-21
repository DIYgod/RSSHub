const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `http://www.panda.tv/api_room?roomid=${id}`,
        headers: {
            Referer: `https://www.panda.tv/${id}`,
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `${data.hostinfo.name}的熊猫直播间`,
        link: `https://www.panda.tv/${id}`,
        item: [
            {
                title: `开播: ${data.roominfo.name}`,
                description: `<img referrerpolicy="no-referrer" src="${data.roominfo.pictures.img}">`,
                pubDate: new Date(parseInt(data.roominfo.start_time) * 1000).toUTCString(),
                guid: data.roominfo.start_time,
                link: `https://www.panda.tv/${id}`,
            },
            {
                title: `下播: ${data.roominfo.name}`,
                description: `<img referrerpolicy="no-referrer" src="${data.roominfo.pictures.img}">`,
                pubDate: new Date(parseInt(data.roominfo.end_time) * 1000).toUTCString(),
                guid: data.roominfo.end_time,
                link: `https://www.panda.tv/${id}`,
            },
        ],
    };
};
