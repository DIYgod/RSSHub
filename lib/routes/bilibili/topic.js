const got = require('@/utils/got');

module.exports = async (ctx) => {
    const topic = ctx.params.topic;
    const urlEncodedTopic = encodeURIComponent(topic);

    const response = await got({
        method: 'get',
        url: `https://api.vc.bilibili.com/topic_svr/v1/topic_svr/topic_new?topic_name=${urlEncodedTopic}`,
        headers: {
            Referer: `https://www.bilibili.com/tag/${urlEncodedTopic}/feed`,
        },
        transformResponse: [(data) => data],
    });
    const data = response.data.data.cards;

    ctx.state.data = {
        title: `${topic} 的全部话题`,
        link: `https://www.bilibili.com/tag/${topic}/feed`,
        description: `https://www.bilibili.com/tag/${topic}/feed`,
        item: data.map((item) => {
            const parsed = JSON.parse(item.card);
            const cardData = parsed.item || parsed;

            // img
            let imgHTML = '';
            if (cardData.pictures) {
                for (let i = 0; i < cardData.pictures.length; i++) {
                    imgHTML += `<img src="${cardData.pictures[i].img_src}">`;
                }
            }
            if (cardData.pic) {
                imgHTML += `<img src="${cardData.pic}">`;
            }

            // link
            let link = '';
            if (item.desc && item.desc.dynamic_id_str) {
                link = `https://t.bilibili.com/${item.desc.dynamic_id_str}`;
            }

            return {
                title: cardData.title || cardData.description || cardData.content || (cardData.vest && cardData.vest.content),
                description: `${cardData.desc || cardData.description || cardData.content || cardData.summary || (cardData.vest && cardData.vest.content) + (cardData.sketch && cardData.sketch.title)}${imgHTML} `,
                pubDate: new Date(item.desc.timestamp * 1000).toUTCString(),
                link,
            };
        }),
    };
};
