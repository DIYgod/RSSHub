const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://www.showroom-live.com/api/room/profile?room_id=${id}`,
    });

    const data = response.data;

    let item;
    if (data.is_onlive) {
        item = [
            {
                title: data.room_name,
                pubDate: new Date(data.current_live_started_at * 1000),
                guid: new Date(data.current_live_started_at * 1000).toUTCString(),
                link: data.share_url_live,
            },
        ];
    }

    ctx.state.data = {
        title: `${data.room_name}的SHOWROOM直播间`,
        link: data.share_url_live,
        item,
        allowEmpty: true,
    };
};
