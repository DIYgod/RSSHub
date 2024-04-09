const got = require('@/utils/got');

module.exports = async (ctx) => {
    const gridName = ctx.params.gridName;

    const response = await got({
        method: 'get',
        url: `https://store.playstation.com/valkyrie-api/zh/HK/19/container/${gridName}?size=30&bucket=games&start=0`,
        headers: {
            Referer: `https://store.playstation.com/zh-hans-hk/grid/${gridName}/1`,
        },
    });
    const data = response.data;
    const items = data.included && data.included.filter((item, index) => index % 2);
    const sub = data.included && data.included.filter((item, index) => !(index % 2));

    ctx.state.data = {
        title: `PlayStation Store - ${data.data.attributes.name}`,
        link: `https://store.playstation.com/zh-hans-hk/grid/${gridName}/1`,
        item:
            items &&
            items.map((item, index) => ({
                title: `${item.attributes.name} (${sub[index].attributes.name})`,
                description: `大小：${item.attributes['file-size'].value}${item.attributes['file-size'].unit}<br><br>设备：${item.attributes.platforms.join(', ')}<br><br>类型：${item.attributes.genres.join(', ')}<br><br>评分：${
                    item.attributes['star-rating'].score
                }<br><br>描述：${item.attributes['long-description']}<br><br>预览：${
                    item.attributes['media-list'] && item.attributes['media-list'].preview && item.attributes['media-list'].preview[0] && item.attributes['media-list'].preview[0].url
                        ? `<video src="${item.attributes['media-list'].preview[0].url}" controls="controls" style="width: 100%"></video>`
                        : '无'
                }`,
                link: `https://store.playstation.com/zh-hans-hk/product/${item.id}`,
            })),
    };
};
