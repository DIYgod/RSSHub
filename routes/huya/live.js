const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `https://search.cdn.huya.com/?m=Search&do=getSearchContent&q=${id}&typ=-5&rows=1`;
    const response = await axios({
        method: 'get',
        url: url,
    });

    const data = response.data.response['1'].docs[0];

    let items = [];
    if (data.gameLiveOn) {
        items = [
            {
                title: `${data.live_intro}`,
                pubDate: new Date(data.rec_live_time * 1000).toUTCString(),
                guid: data.uid,
                link: data.game_liveLink,
                image: data.game_avatarUrl180,
            },
        ];
    }

    ctx.state.data = {
        title: `${data.game_nick}的虎牙直播`,
        link: `https://huya.com/${id}`,
        item: items,
    };
};
