const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `https://play.lang.live/${id}`;

    const api = `https://game-api.lang.live/webapi/v1/room/info?room_id=${id}`;
    const response = await got({
        method: 'get',
        url: api,
    });

    let item = [];
    let name = '';
    if (response.data.data.live_info.live_status === 1) {
        name = response.data.data.live_info.nickname;
        item = [
            {
                title: response.data.data.live_info.nickname + '开播了',
                link: url,
                guid: response.data.data.live_info.live_id,
                description: response.data.data.live_info.describe,
            },
        ];
    }

    ctx.state.data = {
        title: `${name}的浪Play直播`,
        link: url,
        item,
        allowEmpty: true,
    };
};
