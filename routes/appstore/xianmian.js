const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const {
        data: { objects: data },
    } = await axios.get('http://app.so/api/v5/appso/discount/?platform=web&limit=20');

    ctx.state.data = {
        title: '每日精品限免 / 促销应用',
        link: 'http://app.so/xianmian/',
        description: '鲜面连线 by AppSo：每日精品限免 / 促销应用',
        item: data.map((item) => ({
            title: item.app.name,
            description: `
          <img referrerpolicy="no-referrer" src="${item.app.icon.image}"/>
          <br/>
          原价：${item.discount_info[0].original_price} -> 现售：${item.discount_info[0].discounted_price}
          <br/>
          平台：${item.app.download_link[0].device}
          <br/>
          ${item.content}
        `,
            pubDate: new Date(item.updated_at).toUTCString(),
            link: item.app.download_link[0].link,
        })),
    };
};
