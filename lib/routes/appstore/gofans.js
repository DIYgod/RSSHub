const axios = require('@/utils/axios');
const url = require('url');

module.exports = async (ctx) => {
    const prefix = 'https://gofans.cn/app/';

    const response = await axios({
        method: 'get',
        url: 'https://api.gofans.cn/v1/m/app_records?page=1&limit=20',
        headers: {
            Referer: 'https://m.gofans.cn',
            Origin: 'https://m.gofans.cn',
        },
    });
    ctx.state.data = {
        title: '最新限免 / 促销应用',
        link: 'https://gofans.cn/',
        description: 'GoFans：最新限免 / 促销应用',
        item: response.data.data.map((item) => ({
            title: `「${item.price === '0.00' ? '免费' : '降价'}」-「${item.kind === '1' ? 'macOS' : 'iOS'}」${item.name}`,
            description: `
          <img referrerpolicy="no-referrer" src="${item.icon.replace('512x512bb', '256x256bb')}"/>
          <br/>
          原价：¥${item.original_price} -> 现价：¥${item.price}
          <br/>
          平台：${item.kind === '1' ? 'macOS' : 'iOS'}
          <br/>
          ${item.description}
        `,
            pubDate: new Date(item.updated_at * 1000).toUTCString(),
            link: url.resolve(prefix, item.uuid),
        })),
    };
};
