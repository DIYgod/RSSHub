const got = require('@/utils/got');

module.exports = async (ctx) => {
    const userUrl = `https://t.kongfz.com/api/getFeedList?userId=${ctx.params.id}&size=20`;
    const response = await got({
        method: 'get',
        url: userUrl,
    });

    const list = response.data.result.feedList.map((item) => {
        let description;
        if (item.content === '件商品') {
            description = '<ul>';
            for (const i of item.itemList) {
                const link = i.defaultItem.linkUrl;
                const name = i.product.itemName;
                const author = i.product.author;
                const quality = i.product.quality;
                const price = i.product.price;
                const image = i.product.imgBig;
                description += `<li><ul><li><a href="${link}">${name}</a></li><li>作者：${author}</li><li>品相：${quality}</li><li>价格：${price}</li><li><img src="${image}"></li></ul></li>`;
            }
            description += '</ul>';
        } else {
            if (item.content === '转发动态') {
                item = item.itemList[0].feed;
            }
            description = item.content;
        }
        return {
            title: item.title || item.postTime,
            link: `https://t.kongfz.com/detail/${item.feedId}`,
            description,
            pubDate: new Date(item.postDateTime).toUTCString(),
        };
    });

    const userInfo = response.data.result.userInfo;

    ctx.state.data = {
        title: `孔夫子旧书网 - ${userInfo.nickname}`,
        link: userInfo.shareUrl,
        item: list,
        description: userInfo.sign,
    };
};
