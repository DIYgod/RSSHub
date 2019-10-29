const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://minapp.com/api/v5/trochili/miniapp/?tag=&offset=0&limit=21',
    });

    const data = response.data.objects;

    ctx.state.data = {
        title: '小程序商店-知晓程序',
        link: 'https://minapp.com/miniapp/',
        description: '知晓程序，让你更知微信小程序。我们提供微信小程序开发资讯，解读微信小程序开发文档，制作微信小程序开发教程。此外，我们还有国内第一家微信小程序商店／应用市场／应用商店。点击入驻，立刻畅游微信小程序的海洋。',
        item: data.map((item) => {
            const screenshots = item.screenshot.reduce((screenshots, item) => {
                screenshots += `<img src="${item.image}"><br>`;
                return screenshots;
            }, '');

            return {
                title: `${item.name}-${item.description}`,
                link: `https://minapp.com/miniapp/${item.id}/`,
                description: `
          <strong>${item.name}</strong><br>
          ${item.description}<br><br>
          <img src="${item.qrcode.image}"><br><br>
          <strong>截图:</strong><br>
          ${screenshots}
        `,
                pubDate: new Date(item.created_at * 1000).toUTCString(),
                author: item.created_by,
            };
        }),
    };
};
