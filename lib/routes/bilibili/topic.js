const axios = require('@/utils/axios');
const JSONbig = require('json-bigint');

module.exports = async (ctx) => {
    const topic = ctx.params.topic;
    const urlEncodedTopic = encodeURIComponent(topic);

    const response = await axios({
        method: 'get',
        url: `https://api.vc.bilibili.com/topic_svr/v1/topic_svr/topic_new?topic_name=${urlEncodedTopic}`,
        headers: {
            Referer: `https://www.bilibili.com/tag/${urlEncodedTopic}/feed`,
        },
        transformResponse: [(data) => data],
    });
    const data = JSONbig.parse(response.data).data.cards;

    ctx.state.data = {
        title: `${topic} 的全部话题`,
        link: `https://www.bilibili.com/tag/${topic}/feed`,
        description: `https://www.bilibili.com/tag/${topic}/feed`,
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
            } else if (item.desc && item.desc.dynamic_id) {
                link = `https://t.bilibili.com/${item.desc.dynamic_id}`;
            }

            return {
                title: data.title || data.description || data.content || (data.vest && data.vest.content),
                description: `${data.desc || data.description || data.content || data.summary || (data.vest && data.vest.content) + (data.sketch && data.sketch.title)}${imgHTML} `,
                pubDate: new Date(item.desc.timestamp * 1000).toUTCString(),
                link: link,
            };
        }),
    };
};
