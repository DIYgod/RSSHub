const got = require('@/utils/got');
const config = require('@/config').value;
const logger = require('@/utils/logger');
const sharp = require('sharp');
const imgur = require('imgur');
const fs = require('fs');

if (config.imgur && config.imgur.clientId) {
    imgur.setClientId(config.imgur.clientId);
}

module.exports = async (ctx) => {
    if (!config.telegram || !config.telegram.token || !config.imgur || !config.imgur.clientId) {
        throw 'Telegram Sticker Pack RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }
    const name = ctx.params.name;
    const cacheDays = 30;

    const response = await got({
        method: 'get',
        url: `https://api.telegram.org/bot${config.telegram.token}/getStickerSet?name=${name}`,
    });

    const data = response.data.result;

    const links = await Promise.all(
        data.stickers.map(async (item) => {
            const key = `telegramstickerpack${item.file_id}`;
            const cache = await ctx.cache.get(key);
            if (cache) {
                return Promise.resolve(cache);
            } else {
                const pathResponse = await got({
                    method: 'get',
                    url: `https://api.telegram.org/bot${config.telegram.token}/getFile?file_id=${item.file_id}`,
                });
                const path = pathResponse.data.result.file_path;

                const fileResponse = await got({
                    method: 'get',
                    url: `https://api.telegram.org/file/bot${config.telegram.token}/${path}`,
                    responseType: 'buffer',
                });

                const filePath = `tmp/${item.file_id}.png`;

                await sharp(fileResponse.data)
                    .png()
                    .toFile(filePath);

                let imgurResponse;
                try {
                    imgurResponse = await imgur.uploadFile(filePath);
                } catch (e) {
                    logger.error(`Error in imgur upload ${filePath}`, e);
                }
                const link = imgurResponse.data.link;

                fs.unlink(filePath, (e) => {
                    logger.error(`Error in remove ${filePath}`, e);
                });

                ctx.cache.set(key, link, cacheDays * 24 * 60 * 60);
                return Promise.resolve(link);
            }
        })
    );

    ctx.state.data = {
        title: `${data.title} - Telegram Sticker Pack`,
        link: `https://t.me/addstickers/${name}`,
        item: data.stickers.map((item, index) => ({
            title: item.emoji,
            description: `<img src="${links[index]}">`,
            guid: item.file_id,
            link: links[index],
        })),
    };
};
