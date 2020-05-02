const got = require('@/utils/got');
const JSONbig = require('json-bigint');
const utils = require('./utils');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;

    const response = await got({
        method: 'get',
        url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
        transformResponse: [(data) => data],
    });
    const data = JSONbig.parse(response.body).data.cards;

    ctx.state.data = {
        title: `${data[0].desc.user_profile.info.uname} 的 bilibili 动态`,
        link: `https://space.bilibili.com/${uid}/#/dynamic`,
        description: `${data[0].desc.user_profile.info.uname} 的 bilibili 动态`,
        item: data.map((item) => {
            const parsed = JSONbig.parse(item.card);
            const data = parsed.item || parsed;
            const origin = parsed.origin ? JSONbig.parse(parsed.origin) : null;

            // img
            let imgHTML = '';
            const getImgs = (data) => {
                let imgs = '';
                if (data.pictures) {
                    for (let i = 0; i < data.pictures.length; i++) {
                        imgs += `<img src="${data.pictures[i].img_src}">`;
                    }
                }
                if (data.pic) {
                    imgs += `<img src="${data.pic}">`;
                }
                if (data.cover) {
                    imgs += `<img src="${data.cover}">`;
                }
                if (data.sketch && data.sketch.cover_url) {
                    imgs += `<img src="${data.sketch.cover_url}">`;
                }
                return imgs;
            };

            imgHTML += getImgs(data);

            if (origin) {
                imgHTML += getImgs(origin.item || origin);
            }
            // link
            let link = '';
            if (data.dynamic_id) {
                link = `https://t.bilibili.com/${data.dynamic_id}`;
            } else if (item.desc && item.desc.dynamic_id) {
                link = `https://t.bilibili.com/${item.desc.dynamic_id}`;
            }
            const getTitle = (data) => data.title || data.description || data.content || (data.vest && data.vest.content) || '';
            const getDes = (data) => data.desc || data.description || data.content || data.summary || (data.vest && data.vest.content) + (data.sketch && `<br>${data.sketch.title}<br>${data.sketch.desc_text}`) || data.intro || '';
            const getOriginDes = (data) => (data && data.apiSeasonInfo && data.apiSeasonInfo.title && `//转发自: ${data.apiSeasonInfo.title}`) || '';
            const getOriginName = (data) => data.uname || (data.author && data.author.name) || (data.user && (data.user.uname || data.user.name)) || (data.owner && data.owner.name) || '';
            const getOriginTitle = (data) => (data.title ? `${data.title}<br>` : '');
            const getIframe = (data) => (!disableEmbed && data && data.aid ? `<br><br>${utils.iframe(data.aid)}<br>` : '');
            return {
                title: getTitle(data),
                description: `${getDes(data)}${
                    origin && getOriginName(origin) ? `<br><br>//转发自: @${getOriginName(origin)}: ${getOriginTitle(origin.item || origin)}${getDes(origin.item || origin)}` : `${getOriginDes(origin)}`
                }${getIframe(data)}${getIframe(origin)}${imgHTML ? `<br>${imgHTML}` : ''}`,
                pubDate: new Date(item.desc.timestamp * 1000).toUTCString(),
                link: link,
            };
        }),
    };
};
