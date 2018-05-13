const axios = require('axios');
const art = require('art-template');
const path = require('path');
const config = require('../../config');

module.exports = async (ctx) => {
    const areaID = ctx.params.areaID;
    const order = ctx.params.order;

    let orderTitle = ``;
    switch (order) {
        case "live_time":
            orderTitle = `最新开播`;
            break;
        case "online":
            orderTitle = `人气直播`;
            break;
    }


    const nameResponse = await axios({
        method: 'get',
        url: `https://api.live.bilibili.com/room/v1/Area/getList`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://link.bilibili.com/p/center/index`
        }
    });

    let parentTitle = "";
    let parentID = "";
    let areaTitle = "";


    for (parentArea of nameResponse.data.data) {
        for (area of parentArea.list) {
            if (area.id === areaID) {
                parentTitle = parentArea.name;
                parentID = parentArea.id;
                areaTitle = area.name;
                cateID = area.cate_id;
            }
        }
    }

    const response = await axios({
        method: 'get',
        url: `https://api.live.bilibili.com/room/v1/AmuseArea/getThirdPageData?area_id=${areaID}&sort_type=${order}&page_size=30&scrollTid=0&page_no=1`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://live.bilibili.com/pages/area/ent-all`
        }
    });
    const data = response.data.data.room_list;

    ctx.state.data = {
        title: `哔哩哔哩直播-${parentTitle}·${areaTitle}分区-${orderTitle}`,
        link: `https://live.bilibili.com/pages/area/ent-all#${parentID}/${areaID}`,
        description: `哔哩哔哩直播-${parentTitle}·${areaTitle}分区-${orderTitle}`,
        lastBuildDate: new Date().toUTCString(),
        item: data.map((item) => ({
            title: `${item.uname} ${item.title}`,
            description: `${item.uname} ${item.title}`,
            pubDate: new Date().toUTCString(),
            guid: `https://live.bilibili.com/${item.roomid} ${item.title}`,
            link: `https://live.bilibili.com/${item.roomid}`
        })),
    };
};