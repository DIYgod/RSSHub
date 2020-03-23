const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `https://www.kingkong.com.tw/${id}`;

    const api = `https://api-kk.lv-play.com/webapi/v1/room/info?room_id=${id}`;
    const response = await got({
        method: 'get',
        url: api,
    });

    let item;
    const name = response.data.data.live_info.nickname;
    if (response.data.data.live_info.live_status === 1) {
        item = [
            {
                title: name + '开播了',
                link: url,
                guid: response.data.data.live_info.live_id,
                description: response.data.data.live_info.describe,
            },
        ];
    }

    ctx.state.data = {
        title: `${name}的kingkong直播`,
        link: url,
        item: item,
        allowEmpty: true,
    };
};
