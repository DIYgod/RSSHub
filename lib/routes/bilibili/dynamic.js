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
            if (data.pictures) {
                for (let i = 0; i < data.pictures.length; i++) {
                    imgHTML += `<img src="${data.pictures[i].img_src}">`;
                }
            }
            if (data.pic) {
                imgHTML += `<img src="${data.pic}">`;
            }

            // link
            let link = '';
            if (data.dynamic_id) {
                link = `https://t.bilibili.com/${data.dynamic_id}`;
            } else if (item.desc && item.desc.dynamic_id) {
                link = `https://t.bilibili.com/${item.desc.dynamic_id}`;
            }

            const getDes = (data) => data.desc || data.description || data.content || data.summary || (data.vest && data.vest.content) + (data.sketch && data.sketch.title) || data.intro;
            const getOriginDes = (data) =>
                (data && data.author && data.author.name && `转发自: @${data.author.name}: `) + (data && data.title) + (data && data.image_urls && data.image_urls.length > 0 && `<br><img src="${data.image_urls[0]}">`) ||
                (data && data.apiSeasonInfo && data.apiSeasonInfo.title && `转发自: ${data.apiSeasonInfo.title}`) + (data && data.cover && `<br><img src="${data.cover}">`) ||
                '';

            return {
                title: data.title || data.description || data.content || (data.vest && data.vest.content),
                description: `${getDes(data)}${
                    origin && (origin.user || origin.owner)
                        ? `<br><br>转发自: @${(origin.user && (origin.user.uname || origin.user.name)) || (origin.owner && origin.owner.name)}: ${getDes(origin.item || origin)}`
                        : `${getOriginDes(origin)}`
                }${!disableEmbed && data.aid ? `<br><br>${utils.iframe(data.aid)}<br>` : ''}<br>${imgHTML} `,
                pubDate: new Date(item.desc.timestamp * 1000).toUTCString(),
                link: link,
            };
        }),
    };
};
