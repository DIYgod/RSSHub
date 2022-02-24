const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const {
        data: { objects: data },
    } = await got.get('https://app.so/api/v5/appso/discount/?platform=web&limit=10');

    ctx.state.data = {
        title: '每日精品限免 / 促销应用',
        link: 'http://app.so/xianmian/',
        description: '鲜面连线 by AppSo：每日精品限免 / 促销应用',
        item: data.map((item) => ({
            title: `「${item.discount_info[0].discounted_price === '0.00' ? '免费' : '降价'}」${item.app.name}`,
            description: `
          <img src="${item.app.icon.image}"/>
          <br/>
          原价：¥${item.discount_info[0].original_price} -> 现价：¥${item.discount_info[0].discounted_price}
          <br/>
          平台：${item.app.download_link[0].device}
          <br/>
          ${item.content}
        `,
            pubDate: parseDate(item.updated_at * 1000),
            link: item.app.download_link[0].link,
        })),
    };
};
