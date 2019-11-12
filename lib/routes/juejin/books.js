const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://xiaoce-timeline-api-ms.juejin.im/v1/getListByLastTime?uid=&client_id=&token=&src=web&alias=&pageNum=1',
    });

    const data = response.data.d;

    ctx.state.data = {
        title: '掘金小册',
        link: 'https://juejin.im/books',
        item: data.map(({ title, id, img, desc, createdAt, price }) => ({
            title,
            link: `https://juejin.im/book/${id}`,
            description: `
        <img src="${img}"><br>
        <strong>${title}</strong><br><br>
        ${desc}<br>
        <strong>价格:</strong> ${price}元
      `,
            pubDate: new Date(createdAt).toUTCString(),
            guid: id,
        })),
    };
};
