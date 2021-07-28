const got = require('@/utils/got');

module.exports = async (ctx) => {
    const areaID = ctx.params.areaID;
    const order = ctx.params.order;

    let orderTitle = '';
    switch (order) {
        case 'live_time':
            orderTitle = '最新开播';
            break;
        case 'online':
            orderTitle = '人气直播';
            break;
    }

    const nameResponse = await got({
        method: 'get',
        url: 'https://api.live.bilibili.com/room/v1/Area/getList',
        headers: {
            Referer: 'https://link.bilibili.com/p/center/index',
        },
    });

    let parentTitle = '';
    let parentID = '';
    let areaTitle = '';
    let areaLink = '';

    for (const parentArea of nameResponse.data.data) {
        for (const area of parentArea.list) {
            if (area.id === areaID) {
                parentTitle = parentArea.name;
                parentID = parentArea.id;
                areaTitle = area.name;
                // cateID = area.cate_id;
                switch (parentID) {
                    case 1:
                        areaLink = `https://live.bilibili.com/pages/area/ent-all#${area.cate_id}/${areaID}`;
                        break;
                    case 2:
                    case 3:
                        areaLink = `https://live.bilibili.com/p/eden/area-tags#/${parentID}/${areaID}`;
                        break;
                    case 4:
                        areaLink = 'https://live.bilibili.com/pages/area/draw';
                        break;
                }
            }
        }
    }

    const response = await got({
        method: 'get',
        url: `https://api.live.bilibili.com/room/v1/area/getRoomList?area_id=${areaID}&sort_type=${order}&page_size=30&page_no=1`,
        headers: {
            Referer: 'https://live.bilibili.com/p/eden/area-tags',
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: `哔哩哔哩直播-${parentTitle}·${areaTitle}分区-${orderTitle}`,
        link: `${areaLink}`,
        description: `哔哩哔哩直播-${parentTitle}·${areaTitle}分区-${orderTitle}`,
        item: data.map((item) => ({
            title: `${item.uname} ${item.title}`,
            description: `${item.uname} ${item.title}`,
            pubDate: new Date().toUTCString(),
            guid: `https://live.bilibili.com/${item.roomid} ${item.title}`,
            link: `https://live.bilibili.com/${item.roomid}`,
        })),
    };
};
