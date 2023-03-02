const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://api.zhihu.com/books/features/new',
    });

    const data = response.data.data;

    ctx.state.data = {
        title: '知乎书店-新书抢鲜',
        link: 'https://www.zhihu.com/pub/features/new',
        item: data.map((item) => {
            const authors = item.authors.map((author) => author.name).join('、');

            return {
                title: item.title,
                link: item.url,
                description: `
          <img src="${item.cover.replace(/_.+\.jpg/g, '.jpg')}"><br>
          <strong>${item.title}</strong><br>
          作者: ${authors}<br><br>
          ${item.description}<br><br>
          价格: ${item.promotion.price / 100}元
        `,
            };
        }),
    };
};
