const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const link = 'https://market.douban.com/book/';
    const response = await axios({
        method: 'get',
        url: 'https://market.douban.com/api/freyr/books?page=1&page_size=20&type=book',
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: '豆瓣书店',
        link,
        description: '在豆瓣书店，遇见美好·書生活',
        item: data.map(({ title, url, price, square_pic, rectangle_pic, desc }) => ({
            title,
            link: url,
            description: `
        <img referrerpolicy="no-referrer" src="${rectangle_pic}"><br>
        <img referrerpolicy="no-referrer" src="${square_pic}"><br>
        ${desc}<br>
        <strong>价格:</strong> ${price}元
      `,
        })),
    };
};
