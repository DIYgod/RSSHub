const got = require('@/utils/got');

async function getItemDetail(itemId, ctx) {
    const link = `https://met.red/api/h/weal/getSingleDetail?wealId=${itemId}`;

    const cache = ctx.cache.get(link);
    if (cache) {
        return cache;
    }

    const { data: response } = await got.get(link);
    const image = `<div><img src=${response.data.imgUrl} /></div>`;
    const coupon = response.data.url ? `<div><a href='${response.data.url}'>点击前往活动</a></div>` : '';
    const content = image + coupon + response.data.content;

    ctx.cache.set(link, content);

    return content;
}

async function getItemList() {
    const response = await got('https://met.red/api/h/weal/getListForData');
    return response.data.data;
}

module.exports = async (ctx) => {
    const itemList = await getItemList();

    ctx.state.data = {
        title: '福利资源-met.red',
        url: 'https://met.red/h/weal/list',
        description: '福利资源更新提醒',
        item: await Promise.all(
            itemList.map(async (item) => ({
                title: item.name,
                link: `https://met.red/h/weal/detail/${item.id}`,
                description: await getItemDetail(item.id, ctx),
                guid: item.id,
            }))
        ),
    };
};
