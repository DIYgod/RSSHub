const axios = require('axios');
const JSONbig = require('json-bigint');
const config = require('../../config');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const response = await axios({
        method: 'get',
        url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://space.bilibili.com/${uid}/`
        }
    });
    const data = response.data.data.cards;

    ctx.state.data = {
        title: `${data[0].desc.user_profile.info.uname} 的 bilibili 动态`,
        link: `https://space.bilibili.com/${uid}/#/dynamic`,
        description: `${data[0].desc.user_profile.info.uname} 的 bilibili 动态`,
        item: data.map((item) => {
            const parsed = JSONbig.parse(item.card);
            const data = parsed.item || parsed;

            // img
            let imgHTML = '';
            if (data.pictures) {
                for (let i = 0; i < data.pictures.length; i++) {
                    imgHTML += `<img referrerpolicy="no-referrer" src="${data.pictures[i].img_src}">`;
                }
            }
            if (data.pic) {
                imgHTML += `<img referrerpolicy="no-referrer" src="${data.pic}">`;
            }

            // link
            let link = '';
            if (data.dynamic_id) {
                link = `https://t.bilibili.com/${data.dynamic_id}`;
            }
            else if (data.aid) {
                link = `https://www.bilibili.com/video/av${data.aid}`;
            }
            else if (data.id) {
                link = `https://h.bilibili.com/${data.id}`;
            }

            return {
                title: data.title || data.description || data.content,
                description: `${data.desc || data.description || data.content}${imgHTML}`,
                pubDate: new Date((data.pubdate || data.upload_time || data.timestamp) * 1000).toUTCString(),
                link: link
            };
        }),
    };
};