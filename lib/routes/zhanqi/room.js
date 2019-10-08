const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const regexp = /(?<=window.oPageConfig.oRoom\s*=\s*)\{.*\}/;

    const response = await got({
        method: 'get',
        url: `https://www.zhanqi.tv/${id}`
    });

    const html = response.data;
    const strArr = html.split("\n");
    const str = strArr.find(str => {
        return regexp.test(str);
    });
    // console.log(str.match(regexp)[0]);
    const room = JSON.parse(str.match(regexp)[0]);

    let item;
    if (room.status != 0) {
        item = [
            {
                title: `开播: ${room.title}`,
                pubDate: new Date(new Number(room.liveTime)).toUTCString(),
                guid: room.liveTime,
                link: `https://www.zhanqi.com${room.url}`,
                description: room.roomDesc
            },
        ];
    }
    ctx.state.data = {
        title: `${room.nickname}的战旗直播间`,
        link: `https://www.zhanqi.com${room.url}`,
        item: item,
        allowEmpty: true,
    };
};
