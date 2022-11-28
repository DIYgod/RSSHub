const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `https://www.lang.live/room/${id}`;

    const api = 'https://api.lang.live/langweb/v1/room/liveinfo';
    const {
        data: { data },
    } = await got(api, {
        searchParams: {
            room_id: id,
        },
    });

    let item = [];
    const name = data.live_info.nickname;
    if (data.live_info.live_status === 1) {
        item = [
            {
                title: `${name} 开播了`,
                link: url,
                guid: `lang:live:room:${id}:${data.live_info.live_id}`,
                description: art(path.join(__dirname, 'templates/room.art'), {
                    live_info: data.live_info,
                }),
            },
        ];
    }

    ctx.state.data = {
        title: `${name} 的浪 Play 直播`,
        description: data.live_info.sign,
        link: url,
        item,
        allowEmpty: true,
    };
};
