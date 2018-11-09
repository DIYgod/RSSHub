const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://short-msg-ms.juejin.im/v1/pinList/recommend?uid=&device_id=&token=&src=web&before&limit=50',
    });

    const data = response.data.d.list;

    ctx.state.data = {
        title: '沸点 - 掘金',
        link: 'https://juejin.im/pins',
        item: data.map(({ content, objectId, createdAt, user, pictures, url, urlTitle }) => {
            const imgs = pictures.reduce((imgs, item) => {
                imgs += `
          <img referrerpolicy="no-referrer" src="${item}"><br>
        `;
                return imgs;
            }, '');

            return {
                title: content,
                link: `https://juejin.im/pin/${objectId}`,
                description: `
          ${content}<br>
          ${imgs}<br>
          <a href="${url}">${urlTitle}</a><br>
        `,
                pubDate: new Date(createdAt).toUTCString(),
                author: user.username,
                guid: objectId,
            };
        }),
    };
};
