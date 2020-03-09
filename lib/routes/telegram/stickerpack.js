const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.telegram || !config.telegram.token) {
        throw 'Telegram Sticker Pack RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }
    const name = ctx.params.name;

    const response = await got({
        method: 'get',
        url: `https://api.telegram.org/bot${config.telegram.token}/getStickerSet?name=${name}`,
    });

    const data = response.data.result;

    ctx.state.data = {
        title: `${data.title} - Telegram Sticker Pack`,
        link: `https://t.me/addstickers/${name}`,
        item: data.stickers.map((item) => ({
            title: item.emoji,
            description: item.file_id,
            guid: item.file_id,
        })),
    };
};
